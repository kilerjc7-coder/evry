"use client";

import { Clock, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { CHIPS, type Session } from "@/lib/sessions";

export type MapSessionPreviewProps = {
  session: Session;
  onOpenDetails: () => void;
  onClose: () => void;
  className?: string;
};

function categoryLabel(session: Session) {
  const first = session.chips[0];
  if (!first) return null;
  return CHIPS.find((chip) => chip.id === first)?.label ?? null;
}

/**
 * Compact floating preview for a map pin selection.
 */
export function MapSessionPreview({
  session,
  onOpenDetails,
  onClose,
  className,
}: MapSessionPreviewProps) {
  const category = categoryLabel(session);

  return (
    <Card
      variant="elevated"
      padding="sm"
      className={cn(
        "pointer-events-auto w-full shadow-card backdrop-blur-md",
        "motion-safe:animate-fade-slide motion-reduce:animate-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {category ? (
            <Badge variant="brand" size="sm" className="mb-2">
              {category}
            </Badge>
          ) : null}
          <p className="truncate text-base font-semibold tracking-tight text-fg">
            {session.title}
          </p>
          <p className="mt-0.5 truncate text-sm text-fg-muted">
            {session.trainer}
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <p className="pt-0.5 text-lg font-semibold tracking-tight text-brand">
            {session.priceCredits}
            <span className="ml-0.5 text-xs font-medium text-brand/70">Cr</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Cerrar vista previa"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="mt-3">
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

      <div className="mt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          onClick={onOpenDetails}
        >
          Ver sesión
        </Button>
      </div>
    </Card>
  );
}
