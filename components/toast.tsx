"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export type ToastTone = "urgent" | "success" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  body?: string;
  tone?: ToastTone;
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

  const tone = toast.tone ?? "info";
  const border =
    tone === "urgent"
      ? "border-[#A3E635]"
      : tone === "success"
        ? "border-emerald-500/50"
        : "border-white/15";

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[20px] border ${border} bg-[#0A0A0A]/95 px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md animate-[slideDown_0.35s_ease-out]`}
      role="status"
    >
      {tone === "urgent" ? (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A3E635]" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#A3E635]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.body && (
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
            {toast.body}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="Cerrar alerta"
        onClick={() => onDismiss(toast.id)}
        className="rounded-full p-1 text-zinc-500 transition hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
