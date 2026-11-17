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
    <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Cerrar detalles de sesión"
        className="pointer-events-auto absolute inset-0 bg-bg/50 motion-safe:transition-opacity motion-safe:duration-base motion-reduce:transition-none"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-session-sheet-title"
        className={cn(
          "pointer-events-auto relative z-10 mx-auto w-full max-w-md rounded-t-2xl border border-border border-b-0 bg-surface shadow-card",
          "px-5 pt-3",
          "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "motion-safe:animate-fade-slide motion-reduce:animate-none"
        )}
      >
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {category ? (
              <Badge variant="brand" size="sm" className="mb-2">
                {category}
              </Badge>
            ) : null}
            <h2
              id="map-session-sheet-title"
              className="text-xl font-semibold tracking-tight text-fg"
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

        <div className="mt-4 flex items-center justify-between gap-3">
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
          <p className="shrink-0 text-2xl font-semibold tracking-tight text-brand">
            {session.priceCredits}
            <span className="ml-1 text-sm font-medium text-brand/70">Cr</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand" aria-hidden />
            {session.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden />
            {session.place}
          </span>
        </div>

        {session.cafyd ? (
          <p className="mt-3 text-xs text-fg-faint">
            Dirigida por profesional CAFYD
          </p>
        ) : null}

        <div className="mt-5">
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
