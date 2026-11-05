"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  MapPin,
  Mic,
  Minimize2,
  Sparkles,
  X,
} from "lucide-react";
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

function SearchBox({
  query,
  setQuery,
  setConsent,
  listening,
  setListening,
  focused,
  setFocused,
  compact,
}: {
  query: string;
  setQuery: (v: string) => void;
  setConsent: (v: boolean) => void;
  listening: boolean;
  setListening: (v: boolean) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  compact?: boolean;
}) {
  const expanded = focused || listening || query.length > 0;

  return (
    <div
      className={`flex items-start rounded-[28px] border bg-[#0A0A0A]/95 backdrop-blur-md transition-all duration-300 ease-out ${
        expanded
          ? "min-h-24 border-[#A3E635]/50 shadow-[0_0_32px_rgba(163,230,53,0.12)]"
          : "min-h-14 border-white/10"
      } ${compact ? "w-full" : ""}`}
    >
      <textarea
        value={query}
        rows={expanded ? 3 : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!query && !listening) setFocused(false);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          if (!hasClinicalTerms(next)) setConsent(false);
        }}
        placeholder="¿Qué quieres entrenar?"
        className={`w-full resize-none bg-transparent px-5 py-4 text-base text-white outline-none placeholder:text-zinc-600 transition-all duration-300 ${
          expanded ? "pt-4" : "py-3.5 leading-[1.75rem]"
        }`}
      />
      <button
        type="button"
        aria-label="Dictado por voz"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setFocused(true);
          setListening(true);
          startDictation(
            (text) => setQuery(query ? `${query} ${text}` : text),
            () => setListening(false)
          );
        }}
        className={`m-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
          listening ? "bg-white text-black" : "bg-[#A3E635] text-black"
        }`}
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterPanel({
  chip,
  setChip,
  open,
  onClose,
}: {
  chip: ChipId | null;
  setChip: (id: ChipId | null) => void;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="animate-[fadeSlide_0.25s_ease-out] rounded-[24px] border border-white/10 bg-[#0A0A0A]/95 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Filtros</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-zinc-500 hover:text-white"
          aria-label="Cerrar filtros"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHIPS.map((item) => {
          const Icon = item.icon;
          const selected = chip === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChip(selected ? null : item.id)}
              className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                selected
                  ? "bg-[#A3E635] text-black"
                  : "border border-white/10 bg-black/40 text-zinc-300 hover:border-[#A3E635]/40"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapCanvas({
  sessions,
  activeId,
  setActiveId,
  expanded,
  onExpand,
}: {
  sessions: Session[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!expanded) onExpand();
      }}
      onKeyDown={(event) => {
        if (!expanded && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onExpand();
        }
      }}
      aria-label={expanded ? "Mapa expandido" : "Expandir mapa"}
      className={`relative w-full overflow-hidden border border-white/10 bg-[#07110c] text-left transition-all duration-500 ease-out ${
        expanded
          ? "fixed inset-0 z-50 h-dvh rounded-none border-0"
          : "h-[38vh] min-h-56 cursor-pointer rounded-[28px]"
      }`}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute left-[18%] top-[22%] h-24 w-28 rounded-full bg-emerald-800/40 blur-sm" />
      <div className="absolute bottom-[12%] left-[8%] h-32 w-40 rounded-full bg-emerald-900/50 blur-sm" />
      <div className="absolute right-[-8%] top-[30%] h-40 w-24 rotate-12 rounded-full bg-emerald-950/80" />

      {!expanded && (
        <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-[#A3E635]" />
          Toca para expandir
        </span>
      )}

      {sessions.map((session) => {
        const selected = activeId === session.id;
        const left = Math.min(84, Math.max(16, session.x));
        const top = Math.min(78, Math.max(28, session.y));
        return (
          <button
            key={session.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setActiveId(session.id);
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span
              className={`block rounded-full px-2.5 py-1 text-xs font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition ${
                selected
                  ? "scale-110 bg-white text-black"
                  : "bg-[#A3E635] text-black"
              }`}
            >
              {session.priceCredits} Cr
            </span>
          </button>
        );
      })}
    </div>
  );
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
  const [focused, setFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
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

  const searchProps = {
    query,
    setQuery,
    setConsent,
    listening,
    setListening,
    focused,
    setFocused,
  };

  return (
    <div className="space-y-5">
      {!mapExpanded && (
        <>
          <SearchBox {...searchProps} />
          {clinical && (
            <label className="-mt-2 flex items-center gap-2 px-2 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="accent-[#A3E635]"
              />
              Usar esta descripción para recomendarte sesiones
            </label>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition ${
                filtersOpen || chip
                  ? "border-[#A3E635]/50 bg-[#A3E635]/10 text-[#A3E635]"
                  : "border-white/10 bg-[#0A0A0A] text-zinc-300 hover:border-white/20"
              }`}
            >
              <Filter className="h-4 w-4" />
              Añadir filtros
              {chip && (
                <span className="ml-1 rounded-full bg-[#A3E635] px-2 py-0.5 text-[10px] font-bold text-black">
                  1
                </span>
              )}
            </button>
            <FilterPanel
              chip={chip}
              setChip={setChip}
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </>
      )}

      <MapCanvas
        sessions={visible}
        activeId={activeId}
        setActiveId={setActiveId}
        expanded={mapExpanded}
        onExpand={() => setMapExpanded(true)}
      />

      {mapExpanded && (
        <div className="pointer-events-none fixed inset-0 z-[55]">
          <div className="pointer-events-auto absolute left-4 right-4 top-4 max-w-md space-y-3 sm:right-auto sm:w-80">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <SearchBox {...searchProps} compact />
              </div>
              <button
                type="button"
                aria-label="Minimizar mapa"
                onClick={() => setMapExpanded(false)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0A0A0A]/95 text-white backdrop-blur-md transition hover:border-[#A3E635]/50 hover:text-[#A3E635]"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold backdrop-blur-md transition ${
                filtersOpen || chip
                  ? "border-[#A3E635]/50 bg-[#A3E635]/15 text-[#A3E635]"
                  : "border-white/10 bg-[#0A0A0A]/95 text-zinc-300"
              }`}
            >
              <Filter className="h-4 w-4" />
              Añadir filtros
            </button>
            <FilterPanel
              chip={chip}
              setChip={setChip}
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {!mapExpanded && (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-1.5 text-[#A3E635]">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Curado para ti
                </span>
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                Entrenamientos Recomendados
              </h2>
            </div>
            <p className="pb-0.5 text-xs text-zinc-600">{visible.length}</p>
          </div>

          {visible.map((session) => {
            const reserved = booked.includes(session.id);
            const short = credits < session.priceCredits && !reserved;
            return (
              <article
                key={session.id}
                className={`rounded-[28px] border bg-[#0A0A0A] p-5 transition ${
                  activeId === session.id
                    ? "border-[#A3E635]"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {session.trainer}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-[#A3E635]">
                    {session.priceCredits}
                    <span className="ml-1 text-sm font-medium text-[#A3E635]/70">
                      Cr
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                  <span>{session.time}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.place}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={reserved || short}
                  onClick={() => reserve(session)}
                  className="mt-4 h-12 w-full rounded-2xl bg-[#A3E635] text-sm font-semibold text-black transition active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {reserved ? "Reservada" : short ? "Sin créditos" : "Reservar"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
