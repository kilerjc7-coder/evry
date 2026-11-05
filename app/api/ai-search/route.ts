import { NextResponse } from "next/server";

interface EphemeralSearchRequest {
  query: string;
  lat: number;
  lng: number;
  explicitRgpdArt9Consent: boolean;
}

const CLINICAL_PAIN_KEYWORDS = [
  "dolor",
  "lumbar",
  "cervical",
  "lesión",
  "lesion",
  "hernia",
  "ciática",
  "ciatica",
  "patología",
  "patologia",
  "espalda",
  "rehabilitación",
];

export async function POST(req: Request) {
  try {
    // 1. Lectura en memoria volátil RAM (Jamás se persiste ni se hace log del texto clínico)
    const body: EphemeralSearchRequest = await req.json();
    const rawText = (body.query || "").toLowerCase();

    // 2. Detección de sintomatología o dolor agudo/subclínico
    const hasClinicalSymptoms = CLINICAL_PAIN_KEYWORDS.some((word) =>
      rawText.includes(word)
    );

    // 3. Si hay términos de salud y no ha marcado la casilla del Art. 9.2 RGPD, solicitar consentimiento
    if (hasClinicalSymptoms && !body.explicitRgpdArt9Consent) {
      return NextResponse.json(
        {
          requiresRgpdConsent: true,
          legalNotice:
            "Aviso Legal (Art. 9.2 RGPD y Ley 44/2003 LOPS): EVRY ofrece exclusivamente actividades físico-deportivas recreativas y de acondicionamiento físico, no servicios médicos ni de fisioterapia. Tu consulta se procesará de forma efímera en memoria volátil sin almacenar datos clínicos y filtrará sesiones compatibles dirigidas exclusivamente por Graduados Universitarios en CAFYD.",
        },
        { status: 200 }
      );
    }

    // 4. Extracción efímera de etiquetas funcionales deportivas genéricas
    const extractedTags: string[] = [];
    if (
      rawText.includes("lumbar") ||
      rawText.includes("espalda") ||
      rawText.includes("sentado") ||
      rawText.includes("oficina")
    ) {
      extractedTags.push(
        "movilidad_articular",
        "fortalecimiento_core",
        "bajo_impacto"
      );
    }
    if (
      rawText.includes("calistenia") ||
      rawText.includes("dominadas") ||
      rawText.includes("fuerza")
    ) {
      extractedTags.push("fuerza_funcional", "calistenia");
    }
    if (extractedTags.length === 0) {
      extractedTags.push("acondicionamiento_general");
    }

    // 5. El texto original (rawText) se descarta al finalizar este bloque de ejecución.
    // Si detectó dolor, se fuerza por código que solo devuelva Graduados en CAFYD.
    return NextResponse.json({
      requiresRgpdConsent: false,
      sanitizedTags: extractedTags,
      requireCafydOnly: hasClinicalSymptoms,
      recommendationMessage: hasClinicalSymptoms
        ? "Opciones de actividad física y sesiones compatibles recomendadas con Educadores Físico-Deportivos (CAFYD):"
        : "Sesiones y microciclos compatibles recomendados cerca de ti:",
    });
  } catch {
    return NextResponse.json(
      { error: "Error procesando la recomendación efímera." },
      { status: 500 }
    );
  }
}
