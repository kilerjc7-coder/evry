"use client";

import { Clock, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardMedia,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { CHIPS, type Session } from "@/lib/sessions";

export type SessionCardProps = {
  session: Session;
  /** Already booked in this explore session. */
  reserved: boolean;
  /** True when credits < session.priceCredits and not reserved. */
  insufficientCredits: boolean;
  /** Highlighted from map pin / list selection. */
  selected?: boolean;
  /** Optional editorial photo; independent of Session until a media catalog exists. */
  imageSrc?: string;
  imageAlt?: string;
  /** Select session for map sync / preview (does not open the sheet). */
  onSelect?: () => void;
  onReserve: () => void;
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
 * Editorial session card for Explore.
 * Presentation only — booking rules stay in the parent.
 */
export function SessionCard({
  session,
  reserved,
  insufficientCredits,
  selected = false,
  imageSrc,
  imageAlt,
  onSelect,
  onReserve,
}: SessionCardProps) {
  const category = categoryLabel(session);
  const disabled = reserved || insufficientCredits;
  const ctaLabel = reserved
    ? "Reservada"
    : insufficientCredits
      ? "Sin créditos"
      : "Reservar";

  return (
    <Card
      variant={selected ? "elevated" : "default"}
      padding="none"
      className={cn(
        "transition duration-fast ease-out",
        selected && "shadow-brand-glow"
      )}
    >
      {/* Selectable region is a real button; reserve CTA stays outside to avoid nested buttons. */}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Seleccionar sesión ${session.title}`}
        onClick={onSelect}
        className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:shadow-[var(--evry-ring-focus)]"
      >
        <CardMedia className="relative h-52 w-full bg-surface-raised">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt?.trim() || session.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-raised" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,var(--evry-brand-subtle),transparent_55%)]" />
              <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(var(--evry-brand)_1px,transparent_1px)] [background-size:18px_18px]" />
            </div>
          )}

          {category ? (
            <Badge
              variant="brand"
              size="sm"
              className="absolute top-3 left-3 z-10"
            >
              {category}
            </Badge>
          ) : null}
        </CardMedia>

        <div className="p-5 pb-0">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <h3 className="min-w-0 text-xl font-semibold tracking-tight text-fg">
                {session.title}
              </h3>
              <p className="shrink-0 text-2xl font-semibold tracking-tight text-brand">
                {session.priceCredits}
                <span className="ml-1 text-sm font-medium text-brand/70">
                  Cr
                </span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="mt-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                size="sm"
                fallback={trainerInitials(session.trainer)}
                alt={session.trainer}
              />
              <p className="truncate text-sm font-medium text-fg-muted">
                {session.trainer}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-fg-subtle">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand" aria-hidden />
                {session.time}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden />
                {session.place}
              </span>
            </div>
          </CardContent>
        </div>
      </button>

      <div className="p-5 pt-4">
        <Button
          type="button"
          variant="primary"
          size="md"
          fullWidth
          disabled={disabled}
          onClick={(event) => {
            // Reserve is outside the select <button>; stopPropagation is defensive.
            event.stopPropagation();
            onReserve();
          }}
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}
