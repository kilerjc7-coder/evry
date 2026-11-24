"use client";

import { useEffect, useRef } from "react";
import { Clock, MapPin, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { CHIPS, type Session } from "@/lib/sessions";

export type MapSessionSheetProps = {
  session: Session;
  reserved: boolean;
  insufficientCredits: boolean;
  onReserve: () => void;
  onClose: () => void;
};

function trainerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`;
}

function categoryLabel(session: Session) {
  const first = session.chips[0];
  if (!first) return null;
  return CHIPS.find((chip) => chip.id === first)?.label ?? null;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusableCandidate(el: HTMLElement) {
  if (el.closest("[inert]")) return false;
  if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") {
    return false;
  }
  if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }
  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  return el.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(isFocusableCandidate);
}

/**
 * Bottom sheet with session details and reserve CTA over the map.
 */
export function MapSessionSheet({
  session,
  reserved,
  insufficientCredits,
  onReserve,
  onClose,
}: MapSessionSheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const category = categoryLabel(session);
  const disabled = reserved || insufficientCredits;
  const ctaLabel = reserved
    ? "Reservada"
    : insufficientCredits
      ? "Sin créditos"
      : "Reservar";

  /* Focus title once on mount (Sheet open). Do not re-run when session/pin changes. */
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /* D3.3.2/C3: keep Tab / Shift+Tab inside the dialog while mounted. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialog) return;

      const focusable = getFocusableElements(dialog);
      const active = document.activeElement as HTMLElement | null;
      const inside = Boolean(active && dialog.contains(active));

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const index = active ? focusable.indexOf(active) : -1;

      if (event.shiftKey) {
        /* Outside, on first, or on non-tabbable inside (e.g. title) → wrap to last. */
        if (!inside || index === 0 || (inside && index === -1)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      /* Outside or on last → wrap to first. Mid-dialog Tab keeps native order. */
      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  /*
    Stacking (D3.3.1): scrim z-110 dims + blocks fondo; pin hit-layer in ExploreView
    sits at z-120; this panel shell is z-130. Desktop: scrim 20 → hits 25 → panel 30.
  */
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar detalles de sesión"
        className={cn(
          "pointer-events-auto fixed inset-0 z-[110] bg-bg/50",
          "motion-safe:transition-opacity motion-safe:duration-base motion-reduce:transition-none",
          /* Desktop: light scrim confined to the map column shell. */
          "lg:absolute lg:inset-0 lg:z-20 lg:rounded-2xl lg:bg-bg/15"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[130] flex flex-col justify-end",
          "lg:absolute lg:inset-0 lg:z-30 lg:justify-end"
        )}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-session-sheet-title"
          tabIndex={-1}
          className={cn(
            /* Mobile: floating glass card (four corners, above BottomNav). */
            "pointer-events-auto relative mx-4 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-bg/55 shadow-card backdrop-blur-xl",
            "px-5 pt-3 pb-5",
            /*
              Mobile: lift above fixed BottomNav (≈4.1–5.5rem chrome).
              Same offset language as expanded MapSessionPreview — safe-area is
              included once in the bottom offset, not again in pb.
            */
            "mb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.75rem))]",
            "motion-safe:animate-fade-slide motion-reduce:animate-none",
            /* Desktop: geometry (2.2.a) + glass surface aligned with Preview (2.2.c). */
            "lg:mx-auto lg:mb-4 lg:w-full lg:max-w-md lg:self-center lg:max-h-[min(22rem,48%)] lg:overflow-y-auto lg:rounded-2xl",
            "lg:border lg:border-white/10 lg:bg-bg/65 lg:px-3.5 lg:pt-3 lg:pb-3.5 lg:backdrop-blur-xl lg:shadow-md"
          )}
        >
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong lg:hidden"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3 lg:gap-2.5">
          <div className="min-w-0">
            {category ? (
              <Badge
                variant="brand"
                size="sm"
                className="relative mb-2 lg:mb-1"
              >
                {category}
              </Badge>
            ) : null}
            <h2
              ref={titleRef}
              id="map-session-sheet-title"
              tabIndex={-1}
              className="text-xl font-semibold tracking-tight text-fg outline-none lg:min-w-0 lg:truncate lg:text-base lg:leading-snug"
            >
              {session.title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Cerrar panel de sesión"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 lg:mt-2.5">
          <div className="flex min-w-0 items-center gap-2.5 lg:gap-2">
            <Avatar
              size="sm"
              fallback={trainerInitials(session.trainer)}
              alt={session.trainer}
            />
            <p className="truncate text-sm font-medium text-fg-muted lg:text-xs">
              {session.trainer}
            </p>
          </div>
          <p className="shrink-0 text-2xl font-semibold tracking-tight text-brand lg:text-lg">
            {session.priceCredits}
            <span className="ml-1 text-sm font-medium text-brand/70 lg:text-xs">
              Cr
            </span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-subtle lg:mt-2 lg:gap-x-2.5 lg:text-[11px]">
          <span className="inline-flex items-center gap-1.5 lg:gap-1">
            <Clock className="h-3.5 w-3.5 text-brand lg:h-3 lg:w-3" aria-hidden />
            {session.time}
          </span>
          <span className="inline-flex items-center gap-1.5 lg:gap-1">
            <MapPin className="h-3.5 w-3.5 text-brand lg:h-3 lg:w-3" aria-hidden />
            {session.place}
          </span>
        </div>

        {session.cafyd ? (
          <p className="mt-2.5 text-xs text-fg-faint lg:mt-2 lg:text-[11px]">
            Dirigida por profesional CAFYD
          </p>
        ) : null}

        <div className="mt-4 lg:mt-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            disabled={disabled}
            onClick={onReserve}
          >
            {ctaLabel}
          </Button>
        </div>
        </div>
      </div>
    </>
  );
}
