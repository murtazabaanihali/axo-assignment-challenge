/**
 * Normalization map for Spanish biomarker names to English standardized names.
 * Categories: Blood Count, Metabolism, Lipids, Proteins, Kidney, Liver, Thyroid,
 * Electrolytes, Coagulation, Hormones, Tumor Markers, Vitamins, Other.
 */
export interface BiomarkerMapping {
  standardName: string;
  standardUnit: string;
  category: string;
  aliases?: string[];
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const BIOMARKER_MAP: Record<string, BiomarkerMapping> = {
  // Blood Count
  "hematies": { standardName: "Erythrocytes (RBC)", standardUnit: "x10⁶/µL", category: "Blood Count", aliases: ["eritrocitos", "rbc", "globulos rojos", "hematies"] },
  "hematocrit": { standardName: "Hematocrit", standardUnit: "%", category: "Blood Count", aliases: ["hct", "hematocrito"] },
  "hemoglobina": { standardName: "Hemoglobin", standardUnit: "g/dL", category: "Blood Count", aliases: ["hgb", "hb", "hemoglobin"] },
  "volumen corpuscular medio": { standardName: "Mean Corpuscular Volume (MCV)", standardUnit: "fL", category: "Blood Count", aliases: ["vcm", "mcv"] },
  "hemoglobina corpuscular media": { standardName: "Mean Corpuscular Hemoglobin (MCH)", standardUnit: "pg", category: "Blood Count", aliases: ["hcm", "mch"] },
  "conc. de hgb. corpuscular media": { standardName: "Mean Corpuscular Hemoglobin Concentration (MCHC)", standardUnit: "g/dL", category: "Blood Count", aliases: ["chcm", "mchc", "concentracion de hemoglobina corpuscular media"] },
  "indice de anisocitosis": { standardName: "Red Cell Distribution Width (RDW)", standardUnit: "%", category: "Blood Count", aliases: ["rdw", "anisocitosis", "indice de distribucion eritrocitaria"] },
  "leucocitos": { standardName: "White Blood Cells (WBC)", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["wbc", "globulos blancos", "leucocitos totales"] },
  "neutrofilos": { standardName: "Neutrophils", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["neutrofilos absolutos", "neutrofilos#", "neutrophils"] },
  "neutrofilos %": { standardName: "Neutrophils (%)", standardUnit: "%", category: "Blood Count", aliases: ["neutrofilos %", "neutro %", "neutrophils %"] },
  "linfocitos": { standardName: "Lymphocytes", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["linfocitos absolutos", "linfocitos#", "lymphocytes"] },
  "linfocitos %": { standardName: "Lymphocytes (%)", standardUnit: "%", category: "Blood Count", aliases: ["linfocitos %", "linf %", "lymphocytes %"] },
  "monocitos": { standardName: "Monocytes", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["monocitos absolutos", "monocitos#", "monocytes"] },
  "monocitos %": { standardName: "Monocytes (%)", standardUnit: "%", category: "Blood Count", aliases: ["monocitos %", "mono %", "monocytes %"] },
  "eosinofilos": { standardName: "Eosinophils", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["eosinofilos absolutos", "eosinofilos#", "eosinophils"] },
  "eosinofilos %": { standardName: "Eosinophils (%)", standardUnit: "%", category: "Blood Count", aliases: ["eosinofilos %", "eosi %", "eosinophils %"] },
  "basofilos": { standardName: "Basophils", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["basofilos absolutos", "basofilos#", "basophils"] },
  "basofilos %": { standardName: "Basophils (%)", standardUnit: "%", category: "Blood Count", aliases: ["basofilos %", "baso %", "basophils %"] },
  "plaquetas": { standardName: "Platelets", standardUnit: "x10³/µL", category: "Blood Count", aliases: ["plt", "plaquetas totales", "platelets"] },
  "volumen plaquetario medio": { standardName: "Mean Platelet Volume (MPV)", standardUnit: "fL", category: "Blood Count", aliases: ["vpm", "mpv"] },
  "grupo sanguineo": { standardName: "Blood Group", standardUnit: "", category: "Other", aliases: ["grupo sanguineo abo", "blood type"] },
  "factor rh": { standardName: "Rh Factor", standardUnit: "", category: "Other", aliases: ["rh", "factor rhesus"] },

  // Metabolism
  "glucosa": { standardName: "Glucose", standardUnit: "mg/dL", category: "Metabolism", aliases: ["glucose", "glucosa en sangre", "glucosa plasmatica", "glucemia"] },
  "hemoglobina a1c": { standardName: "HbA1c", standardUnit: "%", category: "Metabolism", aliases: ["a1c", "hba1c", "hemoglobina glicosilada", "hemoglobina glucosilada", "glycated hemoglobin", "glucosa media"] },
  "fructosamina": { standardName: "Fructosamine", standardUnit: "µmol/L", category: "Metabolism", aliases: ["fructosamine"] },
  "insulina": { standardName: "Insulin", standardUnit: "µUI/mL", category: "Metabolism", aliases: ["insulin"] },
  "homa-ir": { standardName: "HOMA-IR", standardUnit: "", category: "Metabolism", aliases: ["homa ir", "homa", "homa2-ir", "homa insulin resistance"] },

  // Lipids
  "colesterol total": { standardName: "Total Cholesterol", standardUnit: "mg/dL", category: "Lipids", aliases: ["colesterol", "colesterol serico", "ct", "total cholesterol", "cholesterol total"] },
  "colesterol hdl": { standardName: "HDL Cholesterol", standardUnit: "mg/dL", category: "Lipids", aliases: ["hdl-c", "hdl", "colesterol hdl-c", "hdl cholesterol", "good cholesterol", "colesterol bueno"] },
  "colesterol no hdl": { standardName: "Non-HDL Cholesterol", standardUnit: "mg/dL", category: "Lipids", aliases: ["no hdl", "non-hdl", "colesterol no-hdl"] },
  "colesterol ldl": { standardName: "LDL Cholesterol", standardUnit: "mg/dL", category: "Lipids", aliases: ["ldl-c", "ldl", "colesterol ldl-c", "ldl cholesterol", "bad cholesterol", "colesterol malo"] },
  "colesterol vldl": { standardName: "VLDL Cholesterol", standardUnit: "mg/dL", category: "Lipids", aliases: ["vldl-c", "vldl", "colesterol vldl-c"] },
  "trigliceridos": { standardName: "Triglycerides", standardUnit: "mg/dL", category: "Lipids", aliases: ["trigliceridos", "trigliceridos sericos", "tg", "triglycerides", "triacylglicerol"] },
  "lipoproteina (a)": { standardName: "Lipoprotein (a)", standardUnit: "mg/dL", category: "Lipids", aliases: ["lp(a)", "lpa", "lipoproteina a", "lipoprotein a"] },
  "apolipoproteina b": { standardName: "Apolipoprotein B", standardUnit: "mg/dL", category: "Lipids", aliases: ["apo b", "apob", "apolipoprotein b"] },
  "apolipoproteina a1": { standardName: "Apolipoprotein A1", standardUnit: "mg/dL", category: "Lipids", aliases: ["apo a1", "apoa1", "apolipoprotein a1"] },

  // Proteins / Inflammation
  "proteinas totales": { standardName: "Total Protein", standardUnit: "g/dL", category: "Proteins", aliases: ["proteinas totales sericas", "protein total", "total protein"] },
  "albumina": { standardName: "Albumin", standardUnit: "g/dL", category: "Proteins", aliases: ["alb", "albumin serica", "serum albumin"] },
  "proteina c reactiva": { standardName: "C-Reactive Protein (CRP)", standardUnit: "mg/L", category: "Proteins", aliases: ["pcr", "crp", "proteina c reactiva", "c reactive protein"] },
  "pcr ultrasensible": { standardName: "hs-CRP", standardUnit: "mg/L", category: "Proteins", aliases: ["pcr-us", "pcrus", "hs-crp", "ultrasensitive crp", "pcr de alta sensibilidad"] },
  "ferritina": { standardName: "Ferritin", standardUnit: "ng/mL", category: "Proteins", aliases: ["ferritine", "ferritin serica"] },
  "transferrina": { standardName: "Transferrin", standardUnit: "mg/dL", category: "Proteins", aliases: ["transferrin", "siderophilin"] },
  "hierro": { standardName: "Iron", standardUnit: "µg/dL", category: "Proteins", aliases: ["fe", "hierro serico", "serum iron", "iron"] },
  "saturacion de transferrina": { standardName: "Transferrin Saturation", standardUnit: "%", category: "Proteins", aliases: ["ist", "tsi", "saturacion de hierro", "iron saturation"] },
  "globulinas": { standardName: "Globulins", standardUnit: "g/dL", category: "Proteins", aliases: ["globulinas", "globulines"] },

  // Kidney
  "urea": { standardName: "Urea", standardUnit: "mg/dL", category: "Kidney", aliases: ["urea serica", "blood urea nitrogen", "bun"] },
  "creatinina": { standardName: "Creatinine", standardUnit: "mg/dL", category: "Kidney", aliases: ["creat", "creatinina serica", "serum creatinine", "creatinine"] },
  "acido urico": { standardName: "Uric Acid", standardUnit: "mg/dL", category: "Kidney", aliases: ["uric acid", "acido urico serico", "urico"] },
  "filtrado glomerular": { standardName: "eGFR", standardUnit: "mL/min/1.73m²", category: "Kidney", aliases: ["tfg", "fg", "fgr", "egfr", "filtracion glomerular", "tasa de filtracion glomerular", "glomerular filtration rate"] },
  "urea en orina": { standardName: "Urine Urea", standardUnit: "g/24h", category: "Kidney", aliases: ["urea orina", "urea 24h"] },
  "creatinina en orina": { standardName: "Urine Creatinine", standardUnit: "mg/24h", category: "Kidney", aliases: ["creatinina orina", "creatinina 24h"] },
  "proteinuria": { standardName: "Proteinuria", standardUnit: "mg/24h", category: "Kidney", aliases: ["proteinas en orina", "proteinuria de 24h", "proteinuria 24 horas"] },
  "albuminuria": { standardName: "Albuminuria", standardUnit: "mg/24h", category: "Kidney", aliases: ["albumina en orina", "microalbuminuria"] },

  // Liver
  "bilirrubina total": { standardName: "Total Bilirubin", standardUnit: "mg/dL", category: "Liver", aliases: ["bilirrubina", "bilirrubina t", "total bilirubin", "bt"] },
  "bilirrubina directa": { standardName: "Direct Bilirubin", standardUnit: "mg/dL", category: "Liver", aliases: ["bilirrubina conjugada", "bilirrubina d", "conjugated bilirubin", "bd"] },
  "bilirrubina indirecta": { standardName: "Indirect Bilirubin", standardUnit: "mg/dL", category: "Liver", aliases: ["bilirrubina no conjugada", "bilirrubina i", "unconjugated bilirubin", "bi"] },
  "aspartato aminotransferasa": { standardName: "AST", standardUnit: "U/L", category: "Liver", aliases: ["ast", "got", "tgo", "aspartate aminotransferase", "glutamico oxalacetico transaminasa", "got (ast)"] },
  "alanina aminotransferasa": { standardName: "ALT", standardUnit: "U/L", category: "Liver", aliases: ["alt", "gpt", "tgp", "alanine aminotransferase", "glutamico piruvico transaminasa", "gpt (alt)"] },
  "gamma-glutamil transferasa": { standardName: "GGT", standardUnit: "U/L", category: "Liver", aliases: ["ggt", "gamma gt", "gamma-glutamiltransferasa", "gamma glutamyl transferase"] },
  "fosfatasa alcalina": { standardName: "ALP", standardUnit: "U/L", category: "Liver", aliases: ["alp", "fa", "f.a.", "fosfatasa alcalina total", "alkaline phosphatase"] },
  "lactato deshidrogenasa": { standardName: "LDH", standardUnit: "U/L", category: "Liver", aliases: ["ldh", "lactate dehydrogenase", "deshidrogenasa lactica"] },
  "amilasa": { standardName: "Amylase", standardUnit: "U/L", category: "Liver", aliases: ["amilasa serica", "amylase", "amilasa pancreas", "amilasa pancreatica"] },
  "lipasa": { standardName: "Lipase", standardUnit: "U/L", category: "Liver", aliases: ["lipasa serica", "lipase", "lipasa pancreatica"] },

  // Thyroid
  "tsh": { standardName: "TSH", standardUnit: "µUI/mL", category: "Thyroid", aliases: ["tsh", "hormona estimulante de la tiroides", "thyroid stimulating hormone", "tirotropina"] },
  "t4 libre": { standardName: "Free T4", standardUnit: "ng/dL", category: "Thyroid", aliases: ["ft4", "t4l", "t4 libre", "tiroxina libre", "free thyroxine", "t4 free"] },
  "t3 libre": { standardName: "Free T3", standardUnit: "pg/mL", category: "Thyroid", aliases: ["ft3", "t3l", "t3 libre", "triyodotironina libre", "free triiodothyronine", "t3 free"] },
  "t4": { standardName: "Total T4", standardUnit: "µg/dL", category: "Thyroid", aliases: ["t4 total", "tiroxina total", "total thyroxine"] },
  "t3": { standardName: "Total T3", standardUnit: "ng/dL", category: "Thyroid", aliases: ["t3 total", "triyodotironina total", "total triiodothyronine"] },
  "anticuerpos anti-tpo": { standardName: "Anti-TPO Antibodies", standardUnit: "IU/mL", category: "Thyroid", aliases: ["anti-tpo", "antitpo", "anticuerpos antitiroideos", "antithyroid peroxidase", "tpo antibodies", "anti peroxidasa"] },
  "anticuerpos anti-tg": { standardName: "Anti-TG Antibodies", standardUnit: "IU/mL", category: "Thyroid", aliases: ["anti-tg", "antitg", "anticuerpos anti tiroglobulina", "antithyroglobulin", "tg antibodies", "anti tiroglobulina"] },

  // Electrolytes
  "sodio": { standardName: "Sodium", standardUnit: "mEq/L", category: "Electrolytes", aliases: ["na", "sodio serico", "serum sodium", "sodium"] },
  "potasio": { standardName: "Potassium", standardUnit: "mEq/L", category: "Electrolytes", aliases: ["k", "potasio serico", "serum potassium", "potassium"] },
  "cloro": { standardName: "Chloride", standardUnit: "mEq/L", category: "Electrolytes", aliases: ["cl", "cloro serico", "serum chloride", "chloride"] },
  "calcio": { standardName: "Calcium", standardUnit: "mg/dL", category: "Electrolytes", aliases: ["ca", "calcio serico", "calcio total", "serum calcium", "calcium"] },
  "calcio ionico": { standardName: "Ionized Calcium", standardUnit: "mmol/L", category: "Electrolytes", aliases: ["ca ionico", "calcio libre", "ionized calcium", "calcium ionized"] },
  "fosforo": { standardName: "Phosphorus", standardUnit: "mg/dL", category: "Electrolytes", aliases: ["p", "fosforo serico", "fosfato", "phosphate", "phosphorus", "serum phosphate"] },
  "magnesio": { standardName: "Magnesium", standardUnit: "mg/dL", category: "Electrolytes", aliases: ["mg", "magnesio serico", "serum magnesium", "magnesium"] },
  "bicarbonato": { standardName: "Bicarbonate", standardUnit: "mEq/L", category: "Electrolytes", aliases: ["hco3", "bicarbonato serico", "bicarbonato total", "bicarbonate"] },

  // Coagulation
  "protrombina": { standardName: "PT", standardUnit: "seconds", category: "Coagulation", aliases: ["tp", "tiempo de protrombina", "prothrombin time", "quick"] },
  "inr": { standardName: "INR", standardUnit: "", category: "Coagulation", aliases: ["international normalized ratio", "rni"] },
  "ttpa": { standardName: "APTT", standardUnit: "seconds", category: "Coagulation", aliases: ["aptt", "tiempo parcial de tromboplastina", "tiempo de tromboplastina parcial", "partial thromboplastin time", "ttpa", "tpt"] },
  "fibrinogeno": { standardName: "Fibrinogen", standardUnit: "mg/dL", category: "Coagulation", aliases: ["fibrinogen", "factor i", "fibrinogeno plasmatico"] },

  // Hormones
  "testosterona": { standardName: "Testosterone", standardUnit: "ng/dL", category: "Hormones", aliases: ["testosterone", "testosterona total", "total testosterone"] },
  "testosterona libre": { standardName: "Free Testosterone", standardUnit: "pg/mL", category: "Hormones", aliases: ["free testosterone", "testosterona libre"] },
  "estradiol": { standardName: "Estradiol", standardUnit: "pg/mL", category: "Hormones", aliases: ["e2", "oestradiol", "estradiol serico", "estradiol plasmatico"] },
  "progesterona": { standardName: "Progesterone", standardUnit: "ng/mL", category: "Hormones", aliases: ["progesterone", "progesterona serica"] },
  "lh": { standardName: "LH", standardUnit: "mUI/mL", category: "Hormones", aliases: ["hormona luteinizante", "luteinizing hormone", "luteotropin"] },
  "fsh": { standardName: "FSH", standardUnit: "mUI/mL", category: "Hormones", aliases: ["hormona foliculoestimulante", "follicle stimulating hormone", "folitropin"] },
  "prolactina": { standardName: "Prolactin", standardUnit: "ng/mL", category: "Hormones", aliases: ["prolactin", "prl", "prolactina serica"] },
  "cortisol": { standardName: "Cortisol", standardUnit: "µg/dL", category: "Hormones", aliases: ["cortisol serico", "hydrocortisone", "cortisol total"] },
  "dhea-s": { standardName: "DHEA-S", standardUnit: "µg/dL", category: "Hormones", aliases: ["dhea sulfato", "dheas", "dehydroepiandrosterone sulfate", "sulfato de dehidroepiandrosterona"] },
  "17-oh progesterona": { standardName: "17-OH Progesterone", standardUnit: "ng/mL", category: "Hormones", aliases: ["17-hidroxiprogesterona", "17 oh progesterone"] },
  "shbg": { standardName: "SHBG", standardUnit: "nmol/L", category: "Hormones", aliases: ["sex hormone binding globulin", "globulina fijadora de hormonas sexuales", "globulina transportadora de hormonas sexuales"] },

  // Tumor Markers
  "psa": { standardName: "PSA", standardUnit: "ng/mL", category: "Tumor Markers", aliases: ["prostate specific antigen", "antigeno prostatico especifico", "psa total"] },
  "psa libre": { standardName: "Free PSA", standardUnit: "ng/mL", category: "Tumor Markers", aliases: ["psa free", "free prostate specific antigen", "psa libre"] },
  "cea": { standardName: "CEA", standardUnit: "ng/mL", category: "Tumor Markers", aliases: ["carcinoembryonic antigen", "antigeno carcinoembrionario"] },
  "ca 19-9": { standardName: "CA 19-9", standardUnit: "U/mL", category: "Tumor Markers", aliases: ["ca19-9", "carbohydrate antigen 19-9", "antigeno tumoral ca 19-9"] },
  "ca 125": { standardName: "CA 125", standardUnit: "U/mL", category: "Tumor Markers", aliases: ["ca125", "cancer antigen 125", "antigeno tumoral ca 125"] },
  "afp": { standardName: "AFP", standardUnit: "ng/mL", category: "Tumor Markers", aliases: ["alfa-fetoproteina", "alpha-fetoprotein", "alfa fetoproteina"] },

  // Vitamins
  "vitamina d": { standardName: "Vitamin D (25-OH)", standardUnit: "ng/mL", category: "Vitamins", aliases: ["25-oh vit d", "25-hidroxivitamina d", "vit d", "colecalciferol", "25 oh vitamin d", "vitamin d3"] },
  "vitamina b12": { standardName: "Vitamin B12", standardUnit: "pg/mL", category: "Vitamins", aliases: ["b12", "cobalamina", "vitamina b 12", "vitamin b12"] },
  "folato": { standardName: "Folate", standardUnit: "ng/mL", category: "Vitamins", aliases: ["acido folico", "folic acid", "vitamin b9", "vitamina b9", "folate serum"] },
  "vitamina c": { standardName: "Vitamin C", standardUnit: "mg/dL", category: "Vitamins", aliases: ["acido ascorbico", "ascorbic acid", "vit c", "vitamina c serica"] },

  // Other
  "pth": { standardName: "Parathyroid Hormone (PTH)", standardUnit: "pg/mL", category: "Other", aliases: ["hormona paratiroidea", "parathormone", "parathyroid hormone", "paratohormona"] },
  "pco2": { standardName: "pCO₂", standardUnit: "mmHg", category: "Other", aliases: ["presion de co2", "partial pressure of co2", "pco2 arterial", "paco2"] },
  "po2": { standardName: "pO₂", standardUnit: "mmHg", category: "Other", aliases: ["presion de o2", "partial pressure of o2", "po2 arterial", "pao2"] },
  "ph": { standardName: "pH", standardUnit: "", category: "Other", aliases: ["ph sangre", "ph arterial", "blood ph"] },
  "lactato": { standardName: "Lactate", standardUnit: "mmol/L", category: "Other", aliases: ["acido lactico", "lactic acid", "lactate", "lactato serico"] },
  "acetoacetato": { standardName: "Acetoacetate", standardUnit: "mg/dL", category: "Other", aliases: ["cuerpos cetonicos", "ketone bodies", "acido acetacetico", "acetone"] },
  "microalbumina": { standardName: "Microalbumin", standardUnit: "mg/L", category: "Other", aliases: ["microalbuminuria", "albumina en orina", "urine microalbumin"] },
  "ratio albumina/creatinina": { standardName: "Albumin/Creatinine Ratio", standardUnit: "mg/g", category: "Other", aliases: ["rac", "albumin creatinine ratio", "relacion albumina creatinina"] },
  "gases arteriales": { standardName: "Arterial Blood Gas", standardUnit: "", category: "Other", aliases: ["gasometria arterial", "gases en sangre", "blood gas"] },
};

/** Find the best-matching known biomarker inside a raw line. Longest match wins. */
export function findBiomarkerInLine(line: string): { key: string; mapping: BiomarkerMapping; matchedName: string } | null {
  const normalized = removeAccents(line).toLowerCase();
  const candidates: Array<{ key: string; mapping: BiomarkerMapping; matchedName: string; len: number }> = [];

  for (const [key, mapping] of Object.entries(BIOMARKER_MAP)) {
    const allNames = [key, ...(mapping.aliases || [])];
    for (const name of allNames) {
      const normalizedName = removeAccents(name).toLowerCase();
      if (normalized.includes(normalizedName)) {
        candidates.push({ key, mapping, matchedName: name, len: normalizedName.length });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Longest match first prevents "colesterol" from shadowing "colesterol total"
  candidates.sort((a, b) => b.len - a.len);
  return { key: candidates[0].key, mapping: candidates[0].mapping, matchedName: candidates[0].matchedName };
}
