import {
  findBiomarkerInLine,
  removeAccents,
  type BiomarkerMapping,
} from "./biomarker-map";

interface NumberMatch {
  value: number;
  prefix?: string;
  pos: number;
}

function extractAllNumbers(line: string): NumberMatch[] {
  const matches: NumberMatch[] = [];
  const regex = /([<>])?\s*([0-9]+[.,]?[0-9]*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const num = parseFloat(m[2].replace(",", "."));
    if (!isNaN(num)) {
      matches.push({ value: num, prefix: m[1], pos: m.index });
    }
  }
  return matches;
}

function extractUnitFromLine(line: string): string {
  const unitPatterns = [
    /(mg\/dL|mg\/dl)/i,
    /(g\/dL|g\/dl)/i,
    /(mmol\/L|mmol\/l)/i,
    /(mEq\/L|meq\/l)/i,
    /(U\/L|u\/l|UI\/L|ui\/l|U\/l)/i,
    /(mUI\/mL|mui\/ml|µUI\/mL|µui\/ml)/i,
    /(x10[\s]?[³³3]\/?[µu]?L)/i,
    /(fL|fl)/i,
    /(pg\/mL|pg\/ml)/i,
    /(ng\/mL|ng\/ml)/i,
    /(µg\/dL|ug\/dL|mcg\/dL|µg\/dl|ug\/dl)/i,
    /(μmol\/L|umol\/l|µmol\/L)/i,
    /(nmol\/L|nmol\/l)/i,
    /(pg)/i,
    /(%)/,
    /(mmHg)/i,
    /(mL\/min|ml\/min)/i,
    /(µmol\/L|µmol\/l|umol\/l)/i,
    /(g\/24h)/i,
    /(mg\/24h)/i,
    /(mg\/g)/i,
    /(mg\/L)/i,
  ];
  for (const p of unitPatterns) {
    const m = line.match(p);
    if (m) return m[1];
  }
  return "";
}

function extractRangeFromLine(
  line: string,
  afterPos = 0,
): { min: number | null; max: number | null } {
  const search = line.slice(afterPos);

  // "12.0 - 16.0" or "12.0 – 16.0" or "12.0 a 16.0" or "12.0/16.0"
  const twoSided = search.match(
    /([0-9]+[.,]?[0-9]*)\s*[-–—a\/]\s*([0-9]+[.,]?[0-9]*)/,
  );
  if (twoSided) {
    return {
      min: parseFloat(twoSided[1].replace(",", ".")),
      max: parseFloat(twoSided[2].replace(",", ".")),
    };
  }

  // "< 200" or "<200" or "hasta 200"
  const lessThan = search.match(
    /(?:<|hasta|max\.?|maximo)\s*([0-9]+[.,]?[0-9]*)/i,
  );
  if (lessThan) {
    return { min: null, max: parseFloat(lessThan[1].replace(",", ".")) };
  }

  // "> 40" or ">40" or "desde 40"
  const greaterThan = search.match(
    /(?:>|desde|min\.?|minimo)\s*([0-9]+[.,]?[0-9]*)/i,
  );
  if (greaterThan) {
    return { min: parseFloat(greaterThan[1].replace(",", ".")), max: null };
  }

  return { min: null, max: null };
}

function extractFlagFromLine(line: string): string | null {
  const flagPatterns = [
    /\b(H|L|A)\b/,
    /\*/,
    /\b(alto|alta|high)\b/i,
    /\b(bajo|baja|low)\b/i,
    /\b(anormal|abnormal)\b/i,
  ];
  for (const p of flagPatterns) {
    const m = line.match(p);
    if (m) return m[0];
  }
  return null;
}

function isMetadataLine(line: string): boolean {
  const skipPatterns = [
    /^(page|pag|p\.|fecha|date|hora|time|laboratorio|clinica|direccion|tel|fax|email|www|http|nº|no\.|ref|sample|muestra|paciente|patient|nombre|name|apellidos|surname|edad|age|sexo|sex|dni|nhc|historia|medico|doctor|dr\.?|dra\.?|firm|firma|valid|validado|codigo|nhc|id)/i,
    /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}$/, // pure date
    /^[A-Z\s]{10,}$/, // ALL CAPS long text (headers)
    /^(resultado|parametro|unidad|referencia|valor|normal|prueba|test|analisis|exam)/i,
  ];
  return skipPatterns.some((p) => p.test(line));
}

function parseBiomarkerLine(
  line: string,
  mapping: BiomarkerMapping,
): {
  value: number;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  flag: string | null;
} | null {
  const numbers = extractAllNumbers(line);
  if (numbers.length === 0) return null;

  const normalizedLine = removeAccents(line).toLowerCase();
  const aliases = [
    mapping.standardName.toLowerCase(),
    ...(mapping.aliases || []),
  ];

  // Find biomarker position in line
  let biomarkerPos = Infinity;
  for (const alias of aliases) {
    const idx = normalizedLine.indexOf(removeAccents(alias).toLowerCase());
    if (idx !== -1 && idx < biomarkerPos) biomarkerPos = idx;
  }
  if (biomarkerPos === Infinity) biomarkerPos = 0;

  // Find the first number strictly after the biomarker name
  const valueCandidate = numbers.find((n) => n.pos > biomarkerPos);
  if (!valueCandidate) return null;

  const value = valueCandidate.value;

  // Remaining numbers after the value
  const afterValue = numbers.filter((n) => n.pos > valueCandidate.pos);

  let referenceMin: number | null = null;
  let referenceMax: number | null = null;

  // Check for one-sided ranges using prefixes
  for (const n of afterValue) {
    if (n.prefix === "<") referenceMax = n.value;
    else if (n.prefix === ">") referenceMin = n.value;
  }

  // Check for two-sided range (two consecutive numbers with dash between)
  if (
    afterValue.length >= 2 &&
    !afterValue[0].prefix &&
    !afterValue[1].prefix
  ) {
    const between = line.slice(afterValue[0].pos, afterValue[1].pos);
    if (/[-–—a/]/.test(between)) {
      referenceMin = afterValue[0].value;
      referenceMax = afterValue[1].value;
    }
  }

  // If no range found yet, try regex on the whole remaining line
  if (referenceMin === null && referenceMax === null) {
    const range = extractRangeFromLine(line, valueCandidate.pos);
    referenceMin = range.min;
    referenceMax = range.max;
  }

  const unit = extractUnitFromLine(line) || mapping.standardUnit;
  const flag = extractFlagFromLine(line);

  return { value, unit, referenceMin, referenceMax, flag };
}

export function extractPatientInfoManual(text: string): {
  age: number;
  sex: "male" | "female" | "unknown";
  dateOfBirth?: string;
} {
  const lower = text.toLowerCase();

  let age = 0;
  const agePatterns = [
    /(?:edad|age)[\s:]*(\d{1,3})/i,
    /(\d{1,3})\s*(?:años|anos|years?)/i,
    /(?:edad)\s*[\s/]*\s*(\d{1,3})/i,
  ];
  for (const p of agePatterns) {
    const m = lower.match(p);
    if (m) {
      age = parseInt(m[1], 10);
      break;
    }
  }

  let sex: "male" | "female" | "unknown" = "unknown";
  if (/\b(masculino|hombre|male|var[oó]n|sexo[\s:]*m|sex[\s:]*m)\b/i.test(text))
    sex = "male";
  else if (/\b(femenino|mujer|female|sexo[\s:]*f|sex[\s:]*f)\b/i.test(text))
    sex = "female";

  let dateOfBirth: string | undefined;
  const dobPatterns = [
    /(?:fecha de nacimiento|date of birth|f\.?n\.?|nace|nacimiento)[\s:]+(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
    /(?:fecha de nacimiento|date of birth)[\s:]+(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/i,
  ];
  for (const p of dobPatterns) {
    const m = text.match(p);
    if (m) {
      dateOfBirth = m[1];
      break;
    }
  }

  return { age, sex, dateOfBirth };
}

export function extractBiomarkersManual(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && l.length < 400);

  const found = new Set<string>();
  const biomarkers: Array<{
    rawName: string;
    standardName: string;
    value: number;
    unit: string;
    referenceMin: number | null;
    referenceMax: number | null;
    flag: string | null;
    category: string;
  }> = [];

  for (const line of lines) {
    if (isMetadataLine(line)) continue;

    const match = findBiomarkerInLine(line);
    if (!match) continue;

    if (found.has(match.mapping.standardName)) continue;

    const parsed = parseBiomarkerLine(line, match.mapping);
    if (!parsed) continue;

    // Heuristic: discard if "value" is suspiciously large for the biomarker
    // (e.g., a page number or year instead of a lab value)
    // Most lab values are < 10,000 except WBC/platelets which can be ~500,000
    // But since we're using x10³/µL notation, even those are < 1000 in raw numbers
    if (parsed.value > 50000) continue;

    biomarkers.push({
      rawName: match.key,
      standardName: match.key,
      value: parsed.value,
      unit: parsed.unit,
      referenceMin: parsed.referenceMin,
      referenceMax: parsed.referenceMax,
      flag: parsed.flag,
      category: match.mapping.category,
    });

    found.add(match.mapping.standardName);
  }

  // Generic fallback: try to catch any line that looks like a result but wasn't matched
  const genericPattern =
    /^([A-Za-zÁÉÍÓÚáéíóúñÑ\s\(\)\-%\.]+?)\s+([0-9<>,.]+)\s+([A-Za-z\/\d\^%µμ²³\-\(\)\.]+)(?:\s+([0-9<>.\-–—\s]+))?$/i;

  for (const line of lines) {
    if (isMetadataLine(line)) continue;

    const m = line.match(genericPattern);
    if (!m) continue;

    const rawName = m[1].trim();
    const known = findBiomarkerInLine(rawName);
    if (known) continue; // Already handled above

    const valueStr = m[2].trim();
    const unit = m[3].trim();
    const rangeText = m[4]?.trim() || "";

    const numMatch = valueStr.match(/^([<>])?\s*([0-9]+[.,]?[0-9]*)$/);
    if (!numMatch) continue;

    const value = parseFloat(numMatch[2].replace(",", "."));
    if (isNaN(value) || value > 50000) continue;

    let referenceMin: number | null = null;
    let referenceMax: number | null = null;

    const rangeMatch = rangeText.match(
      /([0-9]+[.,]?[0-9]*)\s*[-–—]\s*([0-9]+[.,]?[0-9]*)/,
    );
    if (rangeMatch) {
      referenceMin = parseFloat(rangeMatch[1].replace(",", "."));
      referenceMax = parseFloat(rangeMatch[2].replace(",", "."));
    } else if (rangeText.startsWith("<")) {
      referenceMax = parseFloat(rangeText.slice(1).replace(",", "."));
    } else if (rangeText.startsWith(">")) {
      referenceMin = parseFloat(rangeText.slice(1).replace(",", "."));
    }

    biomarkers.push({
      rawName,
      standardName: rawName,
      value,
      unit,
      referenceMin,
      referenceMax,
      flag: null,
      category: "Other",
    });
  }

  return biomarkers;
}
