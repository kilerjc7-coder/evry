"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Canonical tones: `info` | `success` | `danger`.
 * `urgent` is a deprecated alias of `danger` (kept for existing callers).
 */
export type ToastTone = "info" | "success" | "danger" | "urgent";

export type ToastMessage = {
  id: string;
  title: string;
  body?: string;
  tone?: ToastTone;
};

type ResolvedTone = "info" | "success" | "danger";

function resolveTone(tone?: ToastTone): ResolvedTone {
  if (tone === "success") return "success";
  if (tone === "danger" || tone === "urgent") return "danger";
  return "info";
}

const toneClasses: Record<ResolvedTone, string> = {
  info: "border-border",
  success: "border-border-brand",
  danger: "border-danger-muted",
};

const toneIconClasses: Record<ResolvedTone, string> = {
  info: "text-fg-muted",
  success: "text-brand",
  danger: "text-danger",
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 7000);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const tone = resolveTone(toast.tone);
  const Icon =
    tone === "danger" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-bg-elevated/95 px-4 py-3 shadow-card backdrop-blur-md animate-slide-down",
        toneClasses[tone]
      )}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", toneIconClasses[tone])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{toast.title}</p>
        {toast.body ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
            {toast.body}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Cerrar notificación"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
