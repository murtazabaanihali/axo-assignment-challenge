"use server";

import { OpenAI } from "openai";
import pdf from "pdf-parse";
import { type AnalysisResult, type Biomarker } from "@/lib/types";
import {
  extractPatientInfoManual,
  extractBiomarkersManual,
} from "@/lib/manual-extractor";

// ─── Client (lazy, only if key exists) ──────────────────────────────────────

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.length < 10) return null;

  return new OpenAI({
    apiKey: key,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com",
  });
}

// ─── Classification ──────────────────────────────────────────────────────────

function classifyValue(
  value: number,
  min: number | null,
  max: number | null,
  category: string,
): "optimal" | "normal" | "out-of-range" | "unclassified" {
  if (min === null && max === null) return "unclassified";

  const lower = min !== null ? min : -Infinity;
  const upper = max !== null ? max : Infinity;
  const inRange = value >= lower && value <= upper;

  if (!inRange) return "out-of-range";

  const rangeSize =
    upper === Infinity || lower === -Infinity ? 0 : upper - lower;
  const buffer = rangeSize * 0.15; // 15% margin from boundaries = "optimal zone"

  if (category === "Lipids") {
    // Upper-bound lipids (lower is better): Total Cholesterol, LDL, etc.
    if (min === null && max !== null && value <= upper - buffer)
      return "optimal";

    // Lower-bound lipids (higher is better): HDL
    if (min !== null && max === null) {
      const distAboveMin = value - min;
      if (distAboveMin >= min * 0.2) return "optimal"; // 20% above minimum = optimal
      return "normal";
    }

    // Two-sided: Non-HDL, ApoB
    if (
      min !== null &&
      max !== null &&
      value >= lower + buffer &&
      value <= upper - buffer
    )
      return "optimal";
    return "normal";
  }

  if (["Blood Count", "Electrolytes", "Coagulation"].includes(category)) {
    // Symmetric ranges — optimal = near center
    const center = (lower + upper) / 2;
    if (Math.abs(value - center) <= rangeSize * 0.3) return "optimal";
    return "normal";
  }

  if (
    ["Metabolism", "Kidney", "Proteins", "Liver", "Thyroid"].includes(category)
  ) {
    // Optimal = comfortably within range, not near either edge
    if (value >= lower + buffer && value <= upper - buffer) return "optimal";
    return "normal";
  }

  return "normal";
}

// ─── AI Extraction ───────────────────────────────────────────────────────────
// AI does everything: parse, translate, normalize, categorize.
// We don't run biomarker-map on AI output — that's the whole point.

async function extractWithAI(
  client: OpenAI,
  rawText: string,
): Promise<AnalysisResult> {
  const systemPrompt = `You are a clinical lab report parser specializing in multilingual medical documents.

Your job:
1. Extract patient demographics (DOB → calculate age, sex).
2. Extract EVERY biomarker, its value, unit, and reference range (min/max as numbers).
3. Translate all biomarker names to standard English medical terminology.
4. Assign each biomarker a category from: Blood Count, Metabolism, Lipids, Proteins, Kidney, Liver, Thyroid, Electrolytes, Coagulation, Hormones, Tumor Markers, Vitamins, Other.
5. Handle values like "<0.2" by storing 0.2 as the value and noting the operator.
6. Handle asterisks (*) or other abnormal flags — include them in the "flag" field.

Return ONLY this JSON structure, no markdown, no commentary:

{
  "patient": {
    "age": number,
    "sex": "male" | "female" | "unknown",
    "dateOfBirth": "YYYY-MM-DD" | null
  },
  "biomarkers": [
    {
      "standardName": "English standardized biomarker name",
      "rawName": "original name from document",
      "value": number,
      "unit": "standardized unit string",
      "referenceMin": number | null,
      "referenceMax": number | null,
      "category": "one of the categories above",
      "flag": "abnormal flag string" | null
    }
  ]
}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: rawText.slice(0, 20000) },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }, // enforce JSON mode
  });

  const content = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(content) as {
    patient: { age: number; sex: string; dateOfBirth?: string | null };
    biomarkers: Array<{
      standardName: string;
      rawName: string;
      value: number;
      unit: string;
      referenceMin: number | null;
      referenceMax: number | null;
      category: string;
      flag?: string | null;
    }>;
  };

  const sex: "male" | "female" | "unknown" =
    parsed.patient.sex === "male" || parsed.patient.sex === "female"
      ? parsed.patient.sex
      : "unknown";

  const biomarkers: Biomarker[] = parsed.biomarkers.map((b) => ({
    rawName: b.rawName,
    standardName: b.standardName, // AI already translated this
    value: b.value,
    unit: b.unit,
    referenceMin: b.referenceMin,
    referenceMax: b.referenceMax,
    category: b.category,
    classification: classifyValue(
      b.value,
      b.referenceMin,
      b.referenceMax,
      b.category,
    ),
    notes: b.flag ? `Flag: ${b.flag}` : undefined,
  }));

  return {
    patient: {
      age: parsed.patient.age ?? 0,
      sex,
      dateOfBirth: parsed.patient.dateOfBirth ?? undefined,
    },
    biomarkers,
    extractionMethod: "ai",
  };
}

// ─── Manual Extraction (fallback only) ──────────────────────────────────────
// Uses biomarker-map for name normalization since AI isn't available.

function extractManually(rawText: string): AnalysisResult {
  const patient = extractPatientInfoManual(rawText);
  const rawBiomarkers = extractBiomarkersManual(rawText);

  const biomarkers: Biomarker[] = rawBiomarkers.map((b) => {
    return {
      rawName: b.rawName,
      standardName: b.rawName,
      value: b.value,
      unit: b.unit,
      referenceMin: b.referenceMin,
      referenceMax: b.referenceMax,
      category: b.category,
      classification: classifyValue(b.value, b.referenceMin, b.referenceMax, b.category),
      notes: b.flag ? `Flag: ${b.flag}` : undefined,
    };
  });

  const sex: "male" | "female" | "unknown" =
    patient.sex === "male" || patient.sex === "female"
      ? patient.sex
      : "unknown";

  return {
    patient: {
      age: patient.age ?? 0,
      sex,
      dateOfBirth: patient.dateOfBirth,
    },
    biomarkers,
    extractionMethod: "manual",
    fallbackNote:
      "AI not configured. Results extracted via regex-based parsing — accuracy depends on PDF format.",
  };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function analyzeReport(
  formData: FormData,
): Promise<AnalysisResult> {
  const file = formData.get("pdf") as File | null;
  if (!file || file.type !== "application/pdf") {
    throw new Error("Please upload a valid PDF file.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const parsed = await pdf(buffer);
  const rawText = parsed.text;

  if (!rawText?.trim()) {
    throw new Error(
      "Could not extract text from PDF. The file may be scanned or corrupted.",
    );
  }

  // ── Decision: AI first, manual only if AI unavailable ──
  const client = getOpenAIClient();

  if (client) {
    try {
      return await extractWithAI(client, rawText);
    } catch (err) {
      console.error(
        "[analyzeReport] AI extraction failed, falling back to manual:",
        err,
      );

      // AI failed at runtime — now try manual
      const result = extractManually(rawText);
      result.fallbackNote =
        "AI extraction failed. Fell back to regex-based parsing.";
      return result;
    }
  }

  // No API key — go straight to manual, no wasted AI attempt
  return extractManually(rawText);
}
