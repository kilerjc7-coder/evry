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
  const mark = trainerInitials(session.trainer);

  return (
    <Card
      variant={selected ? "elevated" : "default"}
      padding="none"
      className={cn(
        "isolate transition duration-fast ease-out",
        selected && "border-border-brand shadow-brand-glow"
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
        {/* relative + isolate + overflow: stable containing block for category badge (WebKit) */}
        <CardMedia className="relative isolate h-36 w-full overflow-hidden bg-surface-raised lg:h-40">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt?.trim() || session.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 bg-surface-raised"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[linear-gradient(160deg,#121212_0%,#0a0a0a_55%,#101013_100%)]" />
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(var(--evry-brand)_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-semibold tracking-tight text-brand/25">
                  {mark}
                </span>
              </div>
              <div className="absolute top-0 left-0 h-full w-0.5 bg-brand/70" />
            </div>
          )}

          {category ? (
            <Badge
              variant="brand"
              size="sm"
              className="absolute top-2.5 left-2.5 z-10"
            >
              {category}
            </Badge>
          ) : null}
        </CardMedia>

        <div className="px-4 pt-3.5 pb-0">
          <CardHeader className="gap-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-fg">
                {session.title}
              </h3>
              <p className="shrink-0 pt-0.5 text-xl font-semibold tracking-tight text-brand">
                {session.priceCredits}
                <span className="ml-0.5 text-xs font-medium text-brand/70">
                  Cr
                </span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="mt-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                fallback={mark}
                alt={session.trainer}
              />
              <p className="truncate text-sm font-medium text-fg-muted">
                {session.trainer}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-brand" aria-hidden />
                {session.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-brand" aria-hidden />
                {session.place}
              </span>
            </div>
          </CardContent>
        </div>
      </button>

      <div className="px-4 pt-3 pb-4">
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
