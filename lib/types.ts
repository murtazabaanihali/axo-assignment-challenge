export type Classification = "optimal" | "normal" | "out-of-range" | "unclassified";

export interface Biomarker {
  rawName: string;
  standardName: string;
  value: number;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  classification: Classification;
  category: string;
  notes?: string;
}

export interface PatientInfo {
  age: number;
  sex: "male" | "female" | "unknown";
  dateOfBirth?: string;
  labName?: string;
}

export interface AnalysisResult {
  patient: PatientInfo;
  biomarkers: Biomarker[];
  extractionMethod: "ai" | "manual";
  fallbackNote?: string;
}
