"use client";

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
  const category = categoryLabel(session);
  const disabled = reserved || insufficientCredits;
  const ctaLabel = reserved
    ? "Reservada"
    : insufficientCredits
      ? "Sin créditos"
      : "Reservar";

  return (
    <div
      className={cn(
        /* Mobile: above AppHeader (z-[100]). Desktop: confined to the map column. */
        "pointer-events-none z-[110] flex flex-col justify-end",
        "fixed inset-0 lg:absolute lg:inset-0 lg:z-20 lg:justify-end"
      )}
    >
      <button
        type="button"
        aria-label="Cerrar detalles de sesión"
        className={cn(
          "pointer-events-auto absolute inset-0 bg-bg/50 motion-safe:transition-opacity motion-safe:duration-base motion-reduce:transition-none",
          "lg:rounded-2xl lg:bg-bg/35"
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-session-sheet-title"
        className={cn(
          /* Mobile: floating glass card (four corners, above BottomNav). */
          "pointer-events-auto relative z-10 mx-4 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-bg/55 shadow-card backdrop-blur-xl",
          "px-5 pt-3 pb-5",
          /*
            Mobile: lift above fixed BottomNav (≈4.1–5.5rem chrome).
            Same offset language as expanded MapSessionPreview — safe-area is
            included once in the bottom offset, not again in pb.
          */
          "mb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.75rem))]",
          "motion-safe:animate-fade-slide motion-reduce:animate-none",
          /* Desktop: compact docked panel — leaves map pins readable above */
          "lg:mx-4 lg:mb-4 lg:max-h-[min(22rem,48%)] lg:max-w-none lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-border-strong lg:bg-bg-elevated/95 lg:px-4 lg:pt-4 lg:pb-4 lg:backdrop-blur-md"
        )}
      >
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong lg:hidden"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {category ? (
              <Badge variant="brand" size="sm" className="relative mb-2">
                {category}
              </Badge>
            ) : null}
            <h2
              id="map-session-sheet-title"
              className="text-xl font-semibold tracking-tight text-fg lg:text-lg"
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

        <div className="mt-3 flex items-center justify-between gap-3 lg:mt-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              size="sm"
              fallback={trainerInitials(session.trainer)}
              alt={session.trainer}
            />
            <p className="truncate text-sm font-medium text-fg-muted">
              {session.trainer}
            </p>
          </div>
          <p className="shrink-0 text-2xl font-semibold tracking-tight text-brand lg:text-xl">
            {session.priceCredits}
            <span className="ml-1 text-sm font-medium text-brand/70">Cr</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-subtle lg:mt-3 lg:gap-x-3 lg:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand lg:h-3 lg:w-3" aria-hidden />
            {session.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand lg:h-3 lg:w-3" aria-hidden />
            {session.place}
          </span>
        </div>

        {session.cafyd ? (
          <p className="mt-2.5 text-xs text-fg-faint">
            Dirigida por profesional CAFYD
          </p>
        ) : null}

        <div className="mt-4 lg:mt-4">
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
  );
}
