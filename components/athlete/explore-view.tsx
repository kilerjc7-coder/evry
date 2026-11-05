"use client";

import { useMemo, useState } from "react";
import { Mic } from "lucide-react";
import { hasClinicalTerms, normalizeText } from "@/lib/clinical";
import { CHIPS, SESSIONS, type ChipId, type Session } from "@/lib/sessions";

type SpeechResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

function startDictation(onText: (text: string) => void, onEnd: () => void) {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) {
    onEnd();
    return;
  }
  const rec = new Ctor();
  rec.lang = "es-ES";
  rec.interimResults = false;
  rec.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? "";
    if (transcript) onText(transcript);
  };
  rec.onend = onEnd;
  rec.start();
}

export function ExploreView({
  credits,
  onBook,
}: {
  credits: number;
  onBook: (price: number) => boolean;
}) {
  const [query, setQuery] = useState("");
  const [consent, setConsent] = useState(false);
  const [chip, setChip] = useState<ChipId | null>(null);
  const [listening, setListening] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const clinical = hasClinicalTerms(query);

  const visible = useMemo(() => {
    const tokens = normalizeText(query)
      .split(/\s+/)
      .filter((word) => word.length > 3);

    return SESSIONS.filter((session) => {
      if (clinical && !session.cafyd) return false;
      if (chip && !session.chips.includes(chip)) return false;
      if (!clinical && tokens.length > 0) {
        const haystack = normalizeText(
          `${session.title} ${session.trainer} ${session.place} ${session.chips.join(" ")}`
        );
        if (!tokens.some((token) => haystack.includes(token))) return false;
      }
      return true;
    });
  }, [chip, clinical, query]);

  function reserve(session: Session) {
    if (booked.includes(session.id)) return;
    if (credits < session.priceCredits) return;
    const ok = onBook(session.priceCredits);
    if (ok) setBooked((prev) => [...prev, session.id]);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex h-14 items-center rounded-full border border-white/10 bg-[#0A0A0A] pl-5 pr-2">
          <input
            value={query}
            onChange={(event) => {
              const next = event.target.value;
              setQuery(next);
              if (!hasClinicalTerms(next)) setConsent(false);
            }}
            placeholder="¿Qué quieres entrenar?"
            className="h-full w-full bg-transparent text-base text-white outline-none placeholder:text-zinc-600"
          />
          <button
            type="button"
            aria-label="Dictado por voz"
            onClick={() => {
              setListening(true);
              startDictation(
                (text) =>
                  setQuery((prev) => (prev ? `${prev} ${text}` : text)),
                () => setListening(false)
              );
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              listening ? "bg-white text-black" : "bg-[#A3E635] text-black"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {clinical && (
          <label className="mt-3 flex items-center gap-2 px-2 text-xs text-zinc-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="accent-[#A3E635]"
            />
            Usar esta descripción para recomendarte sesiones
          </label>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {CHIPS.map((item) => {
          const selected = chip === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChip(selected ? null : item.id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium ${
                selected
                  ? "bg-[#A3E635] text-black"
                  : "border border-white/10 bg-[#0A0A0A] text-white"
              }`}
            >
              {item.emoji} {item.label}
            </button>
          );
        })}
      </div>

      <div className="relative h-[38vh] min-h-56 overflow-hidden rounded-[28px] border border-white/10 bg-[#07110c]">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute left-[18%] top-[22%] h-24 w-28 rounded-full bg-emerald-800/40 blur-sm" />
        <div className="absolute bottom-[12%] left-[8%] h-32 w-40 rounded-full bg-emerald-900/50 blur-sm" />
        <div className="absolute right-[-8%] top-[30%] h-40 w-24 rotate-12 rounded-full bg-emerald-950/80" />

        {visible.map((session) => {
          const selected = activeId === session.id;
          const left = Math.min(84, Math.max(16, session.x));
          const top = Math.min(78, Math.max(28, session.y));
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => setActiveId(session.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span
                className={`block rounded-full px-2.5 py-1 text-xs font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
                  selected ? "bg-white text-black" : "bg-[#A3E635] text-black"
                }`}
              >
                {session.priceCredits} Cr
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {visible.map((session) => {
          const reserved = booked.includes(session.id);
          const short = credits < session.priceCredits && !reserved;
          return (
            <article
              key={session.id}
              className={`rounded-[28px] border bg-[#0A0A0A] p-5 ${
                activeId === session.id
                  ? "border-[#A3E635]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    {session.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">{session.trainer}</p>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-[#A3E635]">
                  {session.priceCredits} Cr
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
                <span>{session.time}</span>
                <span>{session.place}</span>
              </div>
              <button
                type="button"
                disabled={reserved || short}
                onClick={() => reserve(session)}
                className="mt-4 h-12 w-full rounded-2xl bg-[#A3E635] text-sm font-semibold text-black disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {reserved ? "Reservada" : short ? "Sin créditos" : "Reservar"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
