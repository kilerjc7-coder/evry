"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  MapPin,
  Minimize2,
  X,
} from "lucide-react";
import { MapSessionPreview } from "@/components/athlete/explore/map-session-preview";
import { MapSessionSheet } from "@/components/athlete/explore/map-session-sheet";
import { SearchBox } from "@/components/athlete/explore/search-box";
import { SessionCard } from "@/components/athlete/explore/session-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { hasClinicalTerms, normalizeText } from "@/lib/clinical";
import { CHIPS, SESSIONS, type ChipId, type Session } from "@/lib/sessions";

/** Clears sticky AppHeader (logo + py) + safe area; used by expanded map chrome. */
const MAP_EXPANDED_TOP =
  "top-[max(4.5rem,calc(env(safe-area-inset-top)+3.75rem))]";
/** Explicit height — avoids collapse when leaving h-[38vh] (transition-all was zeroing layout). */
const MAP_EXPANDED_HEIGHT =
  "h-[calc(100dvh-max(4.5rem,calc(env(safe-area-inset-top)+3.75rem)))]";

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
  onSelectPin,
  expanded,
  onExpand,
  hideExpandHint,
}: {
  sessions: Session[];
  activeId: string | null;
  onSelectPin: (id: string) => void;
  expanded: boolean;
  onExpand: () => void;
  hideExpandHint?: boolean;
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
      className={cn(
        "relative w-full overflow-hidden border border-border bg-[#07110c] text-left",
        expanded
          ? `fixed inset-x-0 bottom-0 z-50 ${MAP_EXPANDED_TOP} ${MAP_EXPANDED_HEIGHT} rounded-none border-0`
          : "h-[38vh] min-h-56 cursor-pointer rounded-2xl"
      )}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(var(--evry-brand)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute left-[18%] top-[22%] h-24 w-28 rounded-full bg-brand-muted blur-sm" />
      <div className="absolute bottom-[12%] left-[8%] h-32 w-40 rounded-full bg-brand-subtle blur-sm" />
      <div className="absolute right-[-8%] top-[30%] h-40 w-24 rotate-12 rounded-full bg-surface-overlay" />

      {!expanded && !hideExpandHint ? (
        <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-border bg-bg/50 px-3 py-1.5 text-[11px] text-fg-muted backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-brand" aria-hidden />
          Toca para expandir
        </span>
      ) : null}

      {sessions.map((session) => {
        const selected = activeId === session.id;
        const left = Math.min(84, Math.max(16, session.x));
        const top = Math.min(78, Math.max(28, session.y));
        return (
          <button
            key={session.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${session.title}, ${session.priceCredits} créditos`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectPin(session.id);
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:shadow-[var(--evry-ring-focus)]"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span
              className={cn(
                "block rounded-full px-2.5 py-1 text-xs font-semibold shadow-card motion-safe:transition motion-safe:duration-fast motion-reduce:transition-none",
                selected
                  ? "scale-110 bg-fg text-on-brand ring-2 ring-brand"
                  : "bg-brand text-on-brand"
              )}
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
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const activeSession = useMemo(
    () => visible.find((session) => session.id === activeId) ?? null,
    [visible, activeId]
  );

  useEffect(() => {
    if (activeId && !visible.some((session) => session.id === activeId)) {
      setActiveId(null);
      setSheetOpen(false);
    }
  }, [visible, activeId]);

  useEffect(() => {
    if (!sheetOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen]);

  function reserve(session: Session) {
    if (booked.includes(session.id)) return;
    if (credits < session.priceCredits) return;
    const ok = onBook(session.priceCredits);
    if (ok) setBooked((prev) => [...prev, session.id]);
  }

  function selectPin(id: string) {
    setActiveId(id);
  }

  /** List selection syncs the pin and shows Preview Card (never auto-opens the sheet). */
  function selectFromList(id: string) {
    setActiveId(id);
    setSheetOpen(false);
  }

  function clearSelection() {
    setActiveId(null);
    setSheetOpen(false);
  }

  function closeSheet() {
    setSheetOpen(false);
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

  const showPreview = Boolean(activeSession && !sheetOpen);
  const reservedActive = activeSession
    ? booked.includes(activeSession.id)
    : false;
  const insufficientActive = activeSession
    ? credits < activeSession.priceCredits && !reservedActive
    : false;

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

      <div className="relative">
        <MapCanvas
          sessions={visible}
          activeId={activeId}
          onSelectPin={selectPin}
          expanded={mapExpanded}
          onExpand={() => setMapExpanded(true)}
          hideExpandHint={showPreview && !mapExpanded}
        />

        {showPreview && activeSession ? (
          <div
            className={cn(
              "pointer-events-none z-[56]",
              mapExpanded
                ? "fixed inset-x-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] mx-auto max-w-md"
                : "absolute inset-x-3 bottom-3"
            )}
          >
            <MapSessionPreview
              session={activeSession}
              onOpenDetails={() => setSheetOpen(true)}
              onClose={clearSelection}
            />
          </div>
        ) : null}
      </div>

      {sheetOpen && activeSession ? (
        <MapSessionSheet
          session={activeSession}
          reserved={reservedActive}
          insufficientCredits={insufficientActive}
          onReserve={() => reserve(activeSession)}
          onClose={closeSheet}
        />
      ) : null}

      {mapExpanded && (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-[55]",
            MAP_EXPANDED_TOP
          )}
        >
          {/* Same horizontal rhythm as athlete main: mx-auto max-w-md px-4 */}
          <div className="pointer-events-auto mx-auto w-full max-w-md space-y-3 px-4 pt-3">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <SearchBox {...searchProps} compact />
              </div>
              <button
                type="button"
                aria-label="Minimizar mapa"
                onClick={() => setMapExpanded(false)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface/95 text-fg backdrop-blur-md transition hover:border-border-brand hover:text-brand"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold backdrop-blur-md transition",
                filtersOpen || chip
                  ? "border-border-brand bg-brand-muted text-brand"
                  : "border-border bg-surface/95 text-fg-muted"
              )}
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
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-fg">
                Sesiones disponibles
              </h2>
              <p className="mt-1 text-sm text-fg-subtle">
                Según tu búsqueda y filtros
              </p>
            </div>
            <Badge variant="default" size="md" className="shrink-0">
              {visible.length}
            </Badge>
          </div>

          {visible.map((session) => {
            const reserved = booked.includes(session.id);
            const insufficientCredits =
              credits < session.priceCredits && !reserved;

            return (
              <SessionCard
                key={session.id}
                session={session}
                reserved={reserved}
                insufficientCredits={insufficientCredits}
                selected={activeId === session.id}
                onSelect={() => selectFromList(session.id)}
                onReserve={() => reserve(session)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
