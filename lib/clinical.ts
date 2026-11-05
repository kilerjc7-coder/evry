export const CLINICAL_KEYWORDS = [
  "dolor",
  "lesion",
  "molestia",
  "lumbar",
  "cervical",
  "hernia",
  "ciatica",
  "patologia",
  "espalda",
  "rehabilitacion",
];

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function hasClinicalTerms(value: string) {
  const text = normalizeText(value);
  return CLINICAL_KEYWORDS.some((word) => text.includes(word));
}
