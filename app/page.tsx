"use client";

import React, { useState } from "react";
import {
  MapPin,
  Mic,
  Sparkles,
  ShieldCheck,
  Coins,
  Clock,
  Users,
  Award,
  AlertTriangle,
  Lock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  UserCheck,
  Dumbbell,
} from "lucide-react";

type TabType = "explorar" | "monedero" | "lealtad" | "entrenador";

export default function EvryApp() {
  const [activeTab, setActiveTab] = useState<TabType>("explorar");
  const [userCredits, setUserCredits] = useState<number>(350);
  const [aiQuery, setAiQuery] = useState<string>(
    "Tengo 50 años, trabajo sentado en una oficina y me duele la zona lumbar semanalmente"
  );
  const [rgpdConsent, setRgpdConsent] = useState<boolean>(true);
  const [filterCafydOnly, setFilterCafydOnly] = useState<boolean>(true);
  const [rescueActivated, setRescueActivated] = useState<boolean>(false);
  const [activeTags, setActiveTags] = useState<string[]>([
    "movilidad_articular",
    "fortalecimiento_core",
  ]);
  const [legalNotice, setLegalNotice] = useState<string | null>(null);
  const [recommendationMessage, setRecommendationMessage] = useState(
    "Opciones de actividad física y sesiones compatibles recomendadas con Educadores Físico-Deportivos (CAFYD):"
  );
  const [isSearching, setIsSearching] = useState(false);

  const sessions = [
    {
      id: "1",
      title: "Movilidad y Core en Parque de María Luisa",
      trainer: "Carlos Ruiz",
      qualification: "CAFYD",
      colef: "Col. #54821",
      rating: 4.9,
      reviews: 120,
      badge: "El más solicitado",
      modality: "Outdoor Green Exercise",
      format: "Sesión Suelta / Microciclo 4 sem.",
      meetingPoint:
        "Punto de encuentro propuesto por el profesional independiente: Glorieta de Bécquer (Parque de María Luisa)",
      time: "Sábado, 10:00 h (60 min)",
      priceCredits: 12,
      packCredits: 65,
      enrolled: 4,
      minCapacity: 4,
      maxCapacity: 12,
      material: "Esterilla o toalla de yoga",
      tags: ["movilidad_articular", "fortalecimiento_core", "bajo_impacto"],
    },
    {
      id: "2",
      title: "Microciclo Asimilación Dominadas y Fuerza (6 Semanas)",
      trainer: "Álvaro Trejo",
      qualification: "CAFYD",
      colef: "Col. #61094",
      rating: 5.0,
      reviews: 84,
      badge: "5 Estrellas",
      modality: "Outdoor Green Exercise",
      format: "Microciclo 6 semanas (Sobrecarga Progresiva ACSM)",
      meetingPoint:
        "Punto de encuentro propuesto por el profesional independiente: Zona Calistenia Parque del Alamillo",
      time: "Mar y Jue, 18:30 h (60 min)",
      priceCredits: 15,
      packCredits: 75,
      enrolled: 6,
      minCapacity: 4,
      maxCapacity: 8,
      material: "Bandas elásticas (aportadas por el educador)",
      tags: ["fuerza_funcional", "calistenia"],
    },
    {
      id: "3",
      title: "Control Lumbopélvico Síncrono en Directo",
      trainer: "Juan Carlos Raya",
      qualification: "CAFYD",
      colef: "Col. #59310",
      rating: 4.95,
      reviews: 95,
      badge: "Verificado CAFYD",
      modality: "Online Síncrono (Enlace Cifrado)",
      format: "Sesión Online / Cámara encendida",
      meetingPoint: "Zoom / Google Meet (Se desbloquea 10 min antes tras pago)",
      time: "Hoy, 19:30 h (45 min)",
      priceCredits: 8,
      packCredits: 60,
      enrolled: 5,
      minCapacity: 3,
      maxCapacity: 10,
      material: "Esterilla en domicilio",
      tags: ["movilidad_articular", "bajo_impacto", "fortalecimiento_core"],
    },
  ];

  const visibleSessions = sessions.filter((session) => {
    if (filterCafydOnly && session.qualification !== "CAFYD") return false;
    return session.tags.some((tag) => activeTags.includes(tag));
  });

  async function runEphemeralAiSearch() {
    setIsSearching(true);
    setLegalNotice(null);
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: aiQuery,
          lat: 37.3891,
          lng: -5.9845,
          explicitRgpdArt9Consent: rgpdConsent,
        }),
      });
      const data = await response.json();
      if (data.requiresRgpdConsent) {
        setLegalNotice(data.legalNotice);
        return;
      }
      setActiveTags(data.sanitizedTags ?? []);
      setFilterCafydOnly(Boolean(data.requireCafydOnly));
      setRecommendationMessage(data.recommendationMessage);
    } catch {
      setLegalNotice("Error procesando la recomendación efímera.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-lime-400 selection:text-black pb-24">
      {/* Barra Superior Fija */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center text-black font-black tracking-tighter text-lg shadow-[0_0_15px_rgba(163,230,53,0.5)]">
            E
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-lg">
              EVRY
            </span>
            <div className="flex items-center gap-1 text-[11px] text-lime-400 font-medium">
              <MapPin className="w-3 h-3" /> Sevilla, España
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("monedero")}
          className="flex items-center gap-2 bg-zinc-900 border border-lime-400/40 hover:border-lime-400 px-3 py-1.5 rounded-full transition"
        >
          <Coins className="w-4 h-4 text-lime-400" />
          <span className="text-xs font-bold text-white">
            {userCredits} Créditos
          </span>
          <span className="text-[10px] bg-lime-400 text-black font-bold px-1.5 py-0.5 rounded-full">
            1 Cr = 1€
          </span>
        </button>
      </header>

      {/* Contenedor Móvil PWA */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* ================= VISTA 1: EXPLORAR (BUSCADOR IA + POSTGIS) ================= */}
        {activeTab === "explorar" && (
          <>
            {/* Buscador Predictivo con IA (Privacidad Efímera Art. 9 RGPD) */}
            <section className="bg-[#0e0e10] border border-lime-400/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(163,230,53,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime-400">
                  <Sparkles className="w-4 h-4" /> Recomendador IA (NLP)
                </span>
                <span className="text-[10px] bg-lime-400/10 text-lime-300 border border-lime-400/30 px-2 py-0.5 rounded-full">
                  RAM Efímera · Art. 9 RGPD
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  rows={2}
                  className="w-full bg-black border border-zinc-800 focus:border-lime-400 rounded-xl p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none"
                  placeholder="Describe tu objetivo o molestia cotidiana por voz o texto..."
                />
                <button
                  title="Dictado por voz"
                  className="absolute right-2.5 bottom-3 w-7 h-7 rounded-lg bg-lime-400 text-black flex items-center justify-center hover:bg-lime-300 transition"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Aviso Legal Art. 9.2 RGPD y Ley 44/2003 LOPS */}
              <label className="mt-2.5 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rgpdConsent}
                  onChange={(e) => setRgpdConsent(e.target.checked)}
                  className="mt-0.5 accent-lime-400 rounded"
                />
                <span className="text-[10px] text-zinc-400 leading-tight">
                  Consentimiento Art. 9.2 RGPD: Entiendo que EVRY recomienda
                  acondicionamiento físico (no servicios médicos/fisioterapia),
                  descarta mi consulta en RAM sin guardarla en BD y filtra
                  exclusivamente{" "}
                  <strong className="text-lime-400">Graduados CAFYD</strong>.
                </span>
              </label>

              <button
                onClick={runEphemeralAiSearch}
                disabled={isSearching}
                className="mt-3 w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-60 text-black text-xs font-extrabold py-2.5 rounded-xl transition"
              >
                {isSearching ? "Filtrando en RAM…" : "Recomendar sesiones compatibles"}
              </button>

              {legalNotice && (
                <p className="mt-2 text-[10px] text-lime-300 bg-lime-400/10 border border-lime-400/30 rounded-lg p-2">
                  {legalNotice}
                </p>
              )}

              {/* Etiquetas extraídas en memoria volátil */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400">Filtro activo:</span>
                {filterCafydOnly && (
                  <span className="text-[10px] bg-lime-400 text-black font-bold px-2 py-0.5 rounded-md">
                    Solo Titulados CAFYD
                  </span>
                )}
                {activeTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-zinc-900 text-lime-400 border border-zinc-700 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Visor de Mapa Interactivo PostGIS (Sevilla) */}
            <section className="relative h-44 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0b130e] flex flex-col justify-between p-3">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex justify-between items-center">
                <span className="text-[10px] bg-black/80 backdrop-blur border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full">
                  PostGIS Radio Activo: Parques de Sevilla y Centros B2B
                </span>
                <button
                  onClick={() => setFilterCafydOnly(!filterCafydOnly)}
                  className="text-[10px] bg-lime-400 text-black font-bold px-2.5 py-1 rounded-full shadow"
                >
                  {filterCafydOnly ? "CAFYD Exclusivo ✓" : "Todos los Verificados"}
                </button>
              </div>

              {/* Chinchetas Simuladas en Sevilla */}
              <div className="relative z-10 flex items-center justify-around my-auto">
                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-lime-400 text-black font-extrabold text-[10px] shadow-[0_0_12px_#a3e635]">
                    12 Cr · María Luisa
                  </div>
                  <div className="w-2 h-2 bg-lime-400 rotate-45 -mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-zinc-900 border border-lime-400 text-lime-400 font-bold text-[10px]">
                    15 Cr · Alamillo
                  </div>
                  <div className="w-2 h-2 bg-lime-400 rotate-45 -mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-zinc-900 border border-lime-400 text-lime-400 font-bold text-[10px]">
                    8 Cr · Online
                  </div>
                </div>
              </div>

              <p className="relative z-10 text-[10px] text-zinc-400 bg-black/70 px-2 py-1 rounded border border-zinc-800/80">
                Normativa GUMA/IMD: Ubicaciones mostradas como puntos de encuentro
                de educadores independientes, sin publicidad física ni megafonía.
              </p>
            </section>

            {/* Listado de Sesiones y Microciclos Compatibles */}
            <section className="space-y-3">
              <p className="text-[11px] text-lime-300 leading-snug">
                {recommendationMessage}
              </p>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">
                  Sesiones y Microciclos Compatibles
                </h2>
                <span className="text-[11px] text-lime-400 font-medium shrink-0 ml-2">
                  0€ gastos de gestión
                </span>
              </div>

              {visibleSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[#101013] border border-zinc-800 hover:border-lime-400/60 rounded-2xl p-4 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-lime-400/15 text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-full mb-1">
                        <ShieldCheck className="w-3 h-3" /> {session.qualification}{" "}
                        · {session.colef} · SRC Vigente
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {session.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-lime-400">
                        {session.priceCredits} Cr
                      </span>
                      <p className="text-[10px] text-zinc-400">Precio cerrado</p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <span className="text-[11px]">{session.meetingPoint}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-lime-400" />{" "}
                        {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-lime-400" /> Aforo:{" "}
                        {session.enrolled}/{session.maxCapacity} (Mín.{" "}
                        {session.minCapacity})
                      </span>
                    </div>
                  </div>

                  {session.modality.includes("Online") && (
                    <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-300">
                      <Lock className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      Enlace Zoom/Meet cifrado en Supabase hasta confirmar pago.
                    </div>
                  )}

                  {/* Botones de Reserva: Drop-in vs Microciclo (Sobrecarga Progresiva) */}
                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setUserCredits((prev) =>
                          Math.max(0, prev - session.priceCredits)
                        )
                      }
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition"
                    >
                      Sesión Suelta ({session.priceCredits} Cr)
                    </button>
                    <button
                      onClick={() =>
                        setUserCredits((prev) =>
                          Math.max(0, prev - session.packCredits)
                        )
                      }
                      className="bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold py-2 px-3 rounded-xl transition shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                    >
                      Microciclo ({session.packCredits} Cr)
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* ================= VISTA 2: MONEDERO DE CRÉDITOS ================= */}
        {activeTab === "monedero" && (
          <section className="space-y-4">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-lime-400/50 rounded-2xl p-5 text-center space-y-2 shadow-[0_0_30px_rgba(163,230,53,0.12)]">
              <span className="text-xs uppercase tracking-widest text-zinc-400">
                Saldo Disponible (Bono Multiservicio)
              </span>
              <div className="text-4xl font-black text-lime-400">
                {userCredits} Créditos
              </div>
              <p className="text-[11px] text-zinc-400">
                Paridad estricta 1 Crédito = 1,00 € · Vigencia de 6 meses que se
                renueva automáticamente con cada recarga (Ley 21/2011).
              </p>
            </div>

            <h2 className="text-sm font-bold text-white">
              Recargar Packs de Créditos (Sin Cuotas Fijas)
            </h2>

            <div className="space-y-3">
              {/* Pack Inicio */}
              <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Pack Inicio</h3>
                  <p className="text-xs text-zinc-400">
                    20 Créditos · Ideal para probar sesiones sueltas
                  </p>
                </div>
                <button
                  onClick={() => setUserCredits((c) => c + 20)}
                  className="bg-zinc-800 hover:bg-lime-400 hover:text-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Comprar 20 €
                </button>
              </div>

              {/* Pack Progresión (+10%) */}
              <div className="bg-[#101013] border-2 border-lime-400 rounded-2xl p-4 flex items-center justify-between relative shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                <span className="absolute -top-2.5 left-4 bg-lime-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Más Popular · +10% Bonificación
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pack Progresión
                  </h3>
                  <p className="text-xs text-lime-400 font-semibold">
                    55 Créditos (5 créditos gratis incluidos)
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Óptimo para Microciclos de 4 semanas
                  </p>
                </div>
                <button
                  onClick={() => setUserCredits((c) => c + 55)}
                  className="bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Comprar 50 €
                </button>
              </div>

              {/* Pack Pro Adherencia (+15%) */}
              <div className="bg-[#101013] border border-lime-400/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Pack Pro Adherencia
                    </h3>
                    <span className="text-[10px] bg-lime-400/20 text-lime-400 border border-lime-400/40 px-2 py-0.5 rounded-full font-bold">
                      +15% Bono
                    </span>
                  </div>
                  <p className="text-xs text-lime-400 font-semibold">
                    115 Créditos (15 créditos gratis incluidos)
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Máximo ahorro para bloques de 8 semanas
                  </p>
                </div>
                <button
                  onClick={() => setUserCredits((c) => c + 115)}
                  className="bg-zinc-800 hover:bg-lime-400 hover:text-black text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Comprar 100 €
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= VISTA 3: GAMIFICACIÓN Y LEALTAD (SDT) ================= */}
        {activeTab === "lealtad" && (
          <section className="space-y-4">
            <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-lime-400 font-bold">
                    Sistema Dual Anti-Desintermediación
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    Nivel Plata → Camino a Oro
                  </h2>
                </div>
                <Award className="w-8 h-8 text-lime-400" />
              </div>

              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-lime-400 h-full w-3/4 rounded-full shadow-[0_0_10px_#a3e635]" />
              </div>
              <p className="text-xs text-zinc-400">
                9 de 12 sesiones completadas este trimestre. Tus recompensas son
                financiadas al 100% por el margen de EVRY (el entrenador cobra su
                tarifa íntegra).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  tier: "Bronce",
                  perk: "Acceso a microciclos y mapa PostGIS",
                  active: true,
                },
                {
                  tier: "Plata",
                  perk: "Prioridad en lista de espera y becas 12h",
                  active: true,
                },
                {
                  tier: "Oro",
                  perk: "50% dto. en renovación de microciclo",
                  active: false,
                },
                {
                  tier: "Platino",
                  perk: "Sesión gratis al completar bloque de 6 sem.",
                  active: false,
                },
              ].map((item) => (
                <div
                  key={item.tier}
                  className={`p-3 rounded-xl border ${
                    item.active
                      ? "bg-lime-400/10 border-lime-400 text-white"
                      : "bg-[#101013] border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className="text-xs font-extrabold text-lime-400">
                    Nivel {item.tier}
                  </div>
                  <p className="text-[11px] mt-1 leading-snug">{item.perk}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-400">
              <strong className="text-lime-400">
                Salvaguarda Algorítmica Activa:
              </strong>{" "}
              El desbloqueo de recompensas en Oro y Platino verifica en Supabase
              que tu Margen Neto Acumulado supere al menos en 4 veces (tope 25%) el
              coste del beneficio.
            </div>
          </section>
        )}

        {/* ================= VISTA 4: PANEL DEL ENTRENADOR (B2B / AUTÓNOMO) ================= */}
        {activeTab === "entrenador" && (
          <section className="space-y-4">
            {/* Cabecera del Profesional Verificado */}
            <div className="bg-[#101013] border border-lime-400/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-white">Carlos Ruiz</h2>
                  <span className="text-[10px] bg-lime-400 text-black font-extrabold px-2 py-0.5 rounded-full">
                    Verificado CAFYD
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  SRC Profesional + Explotación vigente hasta 15/11/2027
                </p>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] bg-zinc-900 border border-lime-400/40 text-lime-400 px-2 py-0.5 rounded">
                    ★ 4.9 (Top SEO Sevilla)
                  </span>
                  <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                    Retención In-App: 92%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Liquidación Stripe</span>
                <div className="text-xl font-black text-lime-400">1.250 €</div>
                <span className="text-[10px] text-zinc-500">
                  DAC7 + VeriFactu OK
                </span>
              </div>
            </div>

            {/* Alerta del Protocolo de Rescate a 12 Horas (Flujo 2) */}
            <div className="bg-zinc-950 border-2 border-lime-400 rounded-2xl p-4 space-y-3 shadow-[0_0_25px_rgba(163,230,53,0.15)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-lime-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  PROTOCOLO UMBRAL DE 12 HORAS ACTIVO
                </div>
                <span className="text-[10px] bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded-full">
                  Falta 1 plaza
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Tu sesión <strong>Movilidad y Core en Parque de María Luisa</strong>{" "}
                tiene <strong>3 de 4 inscritos</strong> (mínimo configurado por ti).
                Para evitar la cancelación sin vulnerar tu autonomía (Doctrina TJUE
                C-434/15), elige una vía de rescate:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setRescueActivated(true)}
                  className="w-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-between transition"
                >
                  <span>
                    Vía A: Impartir con 0% de comisión EVRY (Cobras el 100%)
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRescueActivated(true)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-lime-400/40 text-lime-400 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-between transition"
                >
                  <span>
                    Vía B: Enviar Beca de Créditos a Lista de Espera / Oro-Platino
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {rescueActivated && (
                <div className="flex items-center gap-2 text-xs text-lime-400 bg-lime-400/10 border border-lime-400/30 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ¡Sesión rescatada y confirmada! Liquidación íntegra asegurada vía
                  Stripe Connect.
                </div>
              )}
            </div>

            {/* Escalones SaaS y Enlace Propio BYOC (3.5% Suelo Técnico) */}
            <div className="bg-[#101013] border border-zinc-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-lime-400">
                  Plan SaaS y Enlace BYOC (Bring Your Own Client)
                </h3>
                <TrendingUp className="w-4 h-4 text-lime-400" />
              </div>
              <p className="text-xs text-zinc-400">
                Nivel actual:{" "}
                <strong className="text-white">
                  Nivel 1 Lanzamiento (0 €/mes)
                </strong>{" "}
                · Take rate: 20% drop-in / 14%-15% en Microciclos.
              </p>
              <div className="bg-black border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">
                    Enlace Propio Cifrado (Tasa Suelo 3,5%)
                  </span>
                  <p className="text-[10px] text-zinc-400">
                    Migra tus alumnos de WhatsApp sin riesgo de impago
                  </p>
                </div>
                <span className="text-[11px] bg-lime-400 text-black font-bold px-2.5 py-1 rounded-lg">
                  evry.app/c/carlos-ruiz
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Navegación Inferior Móvil (PWA Bottom Bar) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#08080a]/95 backdrop-blur-md border-t border-zinc-800">
        <div className="max-w-md mx-auto grid grid-cols-4 py-2">
          <button
            onClick={() => setActiveTab("explorar")}
            className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
              activeTab === "explorar" ? "text-lime-400" : "text-zinc-500"
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            Explorar IA
          </button>
          <button
            onClick={() => setActiveTab("monedero")}
            className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
              activeTab === "monedero" ? "text-lime-400" : "text-zinc-500"
            }`}
          >
            <Coins className="w-5 h-5" />
            Monedero
          </button>
          <button
            onClick={() => setActiveTab("lealtad")}
            className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
              activeTab === "lealtad" ? "text-lime-400" : "text-zinc-500"
            }`}
          >
            <Award className="w-5 h-5" />
            Lealtad
          </button>
          <button
            onClick={() => setActiveTab("entrenador")}
            className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
              activeTab === "entrenador" ? "text-lime-400" : "text-zinc-500"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Panel Pro
          </button>
        </div>
      </nav>
    </div>
  );
}
