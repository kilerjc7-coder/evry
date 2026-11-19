"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

/** Scroll only `container` so a list card enters view (nearest-edge). No-op if already visible. */
function scrollChildIntoListContainer(
  container: HTMLElement,
  child: HTMLElement
) {
  const cRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  if (childRect.top >= cRect.top && childRect.bottom <= cRect.bottom) return;

  if (childRect.top < cRect.top) {
    container.scrollBy({ top: childRect.top - cRect.top, behavior: "smooth" });
    return;
  }
  if (childRect.bottom > cRect.bottom) {
    container.scrollBy({
      top: childRect.bottom - cRect.bottom,
      behavior: "smooth",
    });
  }
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
    <div
      className={cn(
        "animate-[fadeSlide_0.25s_ease-out] rounded-2xl border border-border bg-bg-elevated/95 p-3 backdrop-blur-md",
        /* Mobile: match search frosted glass so the panel reads as one layer. */
        "max-lg:border-white/10 max-lg:bg-bg/60 max-lg:backdrop-blur-xl"
      )}
    >
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
          Filtros
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-fg-subtle transition hover:text-fg"
          aria-label="Cerrar filtros"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CHIPS.map((item) => {
          const Icon = item.icon;
          const selected = chip === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChip(selected ? null : item.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium transition",
                selected
                  ? "bg-brand text-on-brand"
                  : "border border-border bg-surface/80 text-fg-muted hover:border-border-brand hover:text-fg"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
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
  onEmptyClick,
  expanded,
  onExpand,
  hideExpandHint,
  /** Mobile: canvas is an expand control. Desktop: non-interactive region. */
  expandable,
}: {
  sessions: Session[];
  activeId: string | null;
  onSelectPin: (id: string) => void;
  /** Empty map surface (not pins). Skipped while mobile map is still collapsed. */
  onEmptyClick?: () => void;
  expanded: boolean;
  onExpand: () => void;
  hideExpandHint?: boolean;
  expandable: boolean;
}) {
  function handleCanvasClick() {
    /* Collapsed mobile: first empty tap expands and keeps selection. */
    if (expandable && !expanded) {
      onExpand();
      return;
    }
    onEmptyClick?.();
  }

  return (
    <div
      role={expandable ? "button" : "region"}
      tabIndex={expandable ? 0 : undefined}
      onClick={handleCanvasClick}
      onKeyDown={
        expandable
          ? (event) => {
              if (!expanded && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onExpand();
              }
            }
          : undefined
      }
      aria-label={
        expandable
          ? expanded
            ? "Mapa expandido"
            : "Expandir mapa"
          : "Mapa de sesiones"
      }
      className={cn(
        "relative w-full overflow-hidden border border-border bg-[#060a08] text-left",
        /* Desktop: always fills the map column; never goes fixed/fullscreen. */
        "lg:h-full lg:min-h-0 lg:cursor-default lg:rounded-2xl lg:border-border-strong",
        expanded
          ? /* z-50 < AppHeader z-[100]; MAP_EXPANDED_TOP keeps chrome below the header. */
            `fixed inset-x-0 bottom-0 z-50 ${MAP_EXPANDED_TOP} ${MAP_EXPANDED_HEIGHT} rounded-none border-0 lg:static lg:inset-auto lg:z-auto lg:h-full lg:border lg:rounded-2xl`
          : cn(
              /* isolate + z-0: contain blur layers so they can’t paint over sticky AppHeader (iOS). */
              "isolate z-0 h-[38vh] min-h-56 rounded-2xl max-lg:border-transparent lg:h-full lg:min-h-0",
              expandable && "cursor-pointer"
            )
      )}
    >
      {/* Simulated zone field — abstract depth, not real cartography */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#0c1610_0%,#050505_62%)]"
        aria-hidden
      />
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(rgba(163,230,53,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.07)_1px,transparent_1px)] [background-size:48px_48px]",
          /* Mobile collapsed: quieter grid under frosted search. Expanded + desktop keep 0.22. */
          expanded
            ? "opacity-[0.22]"
            : "opacity-[0.06] lg:opacity-[0.22]"
        )}
        aria-hidden
      />
      <div
        className="absolute left-[12%] top-[18%] h-36 w-44 rounded-[40%] bg-brand-subtle blur-2xl"
        aria-hidden
      />
      <div
        className="absolute bottom-[8%] left-[22%] h-40 w-52 rounded-[45%] bg-[#0a1a12] blur-xl"
        aria-hidden
      />
      <div
        className="absolute right-[6%] top-[28%] h-48 w-36 rotate-12 rounded-[40%] bg-surface-overlay/80 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />

      <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-border bg-bg/70 px-2.5 py-1 text-[10px] font-medium tracking-wide text-fg-subtle uppercase backdrop-blur-sm max-lg:hidden">
        <MapPin className="h-3 w-3 text-brand" aria-hidden />
        Zona simulada
      </div>

      {!expanded && !hideExpandHint ? (
        <span className="absolute bottom-3 left-3 z-20 hidden items-center gap-1.5 rounded-full border border-border bg-bg/50 px-3 py-1.5 text-[11px] text-fg-muted backdrop-blur-sm max-lg:flex">
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
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:shadow-[var(--evry-ring-focus)]",
              selected ? "z-20" : "z-10"
            )}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight shadow-card motion-safe:transition motion-safe:duration-fast motion-reduce:transition-none",
                  selected
                    ? "scale-110 bg-fg text-on-brand ring-2 ring-brand ring-offset-2 ring-offset-[#060a08]"
                    : "bg-brand text-on-brand hover:bg-brand-hover"
                )}
              >
                {session.priceCredits} Cr
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rotate-45 rounded-[1px]",
                  selected ? "bg-fg" : "bg-brand"
                )}
                aria-hidden
              />
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
  const [isDesktop, setIsDesktop] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);
  /** Distinguishes map vs list selection without duplicating activeId. */
  const selectionSourceRef = useRef<"map" | "list" | null>(null);

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

  /** One Escape listener: Sheet first (keep activeId → Preview), else clear Preview. */
  useEffect(() => {
    if (!sheetOpen && !activeId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (sheetOpen) {
        setSheetOpen(false);
        return;
      }
      setActiveId(null);
      setSheetOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen, activeId]);

  /** Desktop: embedded map region (no fullscreen expand). */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    function syncDesktop() {
      setIsDesktop(mq.matches);
      if (mq.matches) setMapExpanded(false);
    }
    syncDesktop();
    mq.addEventListener("change", syncDesktop);
    return () => mq.removeEventListener("change", syncDesktop);
  }, []);

  /** Desktop only: after a map pin select, bring the matching list card into view. */
  useEffect(() => {
    if (!isDesktop) {
      selectionSourceRef.current = null;
      return;
    }
    if (selectionSourceRef.current !== "map") {
      selectionSourceRef.current = null;
      return;
    }
    selectionSourceRef.current = null;
    if (!activeId) return;

    const container = listScrollRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>(
      `[data-session-id="${CSS.escape(activeId)}"]`
    );
    if (!card) return;
    scrollChildIntoListContainer(container, card);
  }, [activeId, isDesktop]);

  function reserve(session: Session) {
    if (booked.includes(session.id)) return;
    if (credits < session.priceCredits) return;
    const ok = onBook(session.priceCredits);
    if (ok) setBooked((prev) => [...prev, session.id]);
  }

  function selectPin(id: string) {
    selectionSourceRef.current = "map";
    setActiveId(id);
  }

  /** List selection syncs the pin and shows Preview Card (never auto-opens the sheet). */
  function selectFromList(id: string) {
    selectionSourceRef.current = "list";
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

  function expandMap() {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    setMapExpanded(true);
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

  const filtersControl = (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition",
          filtersOpen || chip
            ? "border-border-brand bg-brand-muted text-brand"
            : cn(
                "border-border bg-bg-elevated text-fg-muted hover:border-border-strong hover:text-fg",
                /* Mobile: frosted glass aligned with SearchBox. */
                "max-lg:border-white/10 max-lg:bg-bg/55 max-lg:backdrop-blur-xl"
              )
        )}
      >
        <Filter className="h-4 w-4" />
        Añadir filtros
        {chip ? (
          <span className="ml-0.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-on-brand">
            1
          </span>
        ) : null}
      </button>
      <FilterPanel
        chip={chip}
        setChip={setChip}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  );

  const sessionList = (
    <>
      <div className="flex items-end justify-between gap-3 px-0.5 pb-1">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-fg lg:text-lg">
            Sesiones disponibles
          </h2>
          <p className="mt-0.5 text-xs text-fg-subtle lg:text-sm">
            Según tu búsqueda y filtros
          </p>
        </div>
        <Badge variant="default" size="sm" className="shrink-0">
          {visible.length}
        </Badge>
      </div>

      {visible.map((session) => {
        const reserved = booked.includes(session.id);
        const insufficientCredits =
          credits < session.priceCredits && !reserved;

        return (
          <div key={session.id} data-session-id={session.id}>
            <SessionCard
              session={session}
              reserved={reserved}
              insufficientCredits={insufficientCredits}
              selected={activeId === session.id}
              onSelect={() => selectFromList(session.id)}
              onReserve={() => reserve(session)}
            />
          </div>
        );
      })}
    </>
  );

  return (
    <div
      className={cn(
        /* Grid areas avoid `display: contents` (WebKit absolute containing-block bugs).
           Mobile: search → map → list. Desktop: 380px sidebar stack + map column. */
        "grid grid-cols-1 gap-5 [grid-template-areas:'search'_'map'_'list']",
        "lg:h-full lg:min-h-0 lg:flex-1 lg:gap-6 lg:overflow-hidden",
        "lg:grid-cols-[380px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)]",
        "lg:[grid-template-areas:'search_map'_'list_map']"
      )}
    >
      {/* DOM order matches visual flow (search → map → list) to avoid WebKit scroll layering. */}
      {!mapExpanded ? (
        <div
          className={cn(
            "[grid-area:search] space-y-5",
            "lg:relative lg:z-10 lg:space-y-3"
          )}
        >
          <SearchBox {...searchProps} />
          {clinical && (
            <label className="-mt-2 flex items-center gap-2 px-2 text-xs text-fg-subtle lg:mt-0">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="accent-brand"
              />
              Usar esta descripción para recomendarte sesiones
            </label>
          )}
          {filtersControl}
        </div>
      ) : null}

      <div
        className={cn(
          /* No z-0 on mobile: avoids a forced stacking context under search/filters. */
          "[grid-area:map] relative min-h-0 w-full",
          "lg:z-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden"
        )}
      >
        <div className="relative min-h-0 w-full min-w-0 lg:h-full lg:min-h-0 lg:flex-1">
          <MapCanvas
            sessions={visible}
            activeId={activeId}
            onSelectPin={selectPin}
            onEmptyClick={
              sheetOpen
                ? closeSheet
                : showPreview
                  ? clearSelection
                  : undefined
            }
            expanded={mapExpanded}
            onExpand={expandMap}
            hideExpandHint={showPreview && !mapExpanded}
            expandable={!isDesktop}
          />

          {showPreview && activeSession ? (
            <div
              className={cn(
                "pointer-events-none z-[56]",
                mapExpanded
                  ? "fixed inset-x-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] mx-auto max-w-md lg:absolute lg:inset-x-3 lg:bottom-3 lg:flex lg:max-w-none lg:justify-center"
                  : "absolute inset-x-3 bottom-3 lg:flex lg:justify-center"
              )}
            >
              <MapSessionPreview
                session={activeSession}
                onOpenDetails={() => setSheetOpen(true)}
                onClose={clearSelection}
              />
            </div>
          ) : null}

          {sheetOpen && activeSession ? (
            <MapSessionSheet
              session={activeSession}
              reserved={reservedActive}
              insufficientCredits={insufficientActive}
              onReserve={() => reserve(activeSession)}
              onClose={closeSheet}
            />
          ) : null}
        </div>
      </div>

      {!mapExpanded ? (
        <div
          className={cn(
            "[grid-area:list] min-h-0",
            "lg:relative lg:z-10 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden"
          )}
        >
          {/* overscroll-contain: keep wheel inside the list once it is a real scrollport */}
          <div
            ref={listScrollRef}
            className="space-y-3 lg:min-h-0 lg:flex-1 lg:space-y-3 lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
          >
            {sessionList}
          </div>
        </div>
      ) : null}

      {mapExpanded ? (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-[55] lg:hidden",
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
                "flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold backdrop-blur-xl transition",
                filtersOpen || chip
                  ? "border-border-brand bg-brand-muted text-brand"
                  : "border-white/10 bg-bg/55 text-fg-muted"
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
      ) : null}
    </div>
  );
}
