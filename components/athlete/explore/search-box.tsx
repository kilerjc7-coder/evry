"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { hasClinicalTerms } from "@/lib/clinical";

export type SearchBoxProps = {
  query: string;
  setQuery: (v: string) => void;
  setConsent: (v: boolean) => void;
  listening: boolean;
  setListening: (v: boolean) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  compact?: boolean;
};

/** Full mic UX state after client capability detection. */
export type MicState =
  | "unsupported"
  | "insecure-context"
  | "idle"
  | "starting"
  | "listening"
  | "error"
  | "stopping";

type SpeechResultList = {
  length: number;
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechResultList) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

/** Cross-instance notice when SearchBox remounts (e.g. map expand). */
let pendingDictationNotice: string | null = null;

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function isAppleMobileUa() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function messageForErrorCode(code: string): string {
  switch (code) {
    case "not-allowed":
      return "No hay permiso para usar el micrófono.";
    case "service-not-allowed":
      return "El servicio de dictado no está disponible.";
    case "network":
      return "Error de red al dictar. Comprueba tu conexión.";
    case "no-speech":
      return "No se detectó voz. Prueba de nuevo.";
    case "audio-capture":
      return "No se pudo acceder al micrófono.";
    case "aborted":
      return "";
    default:
      return "No se pudo completar el dictado.";
  }
}

function ariaLabelForState(state: MicState): string {
  switch (state) {
    case "unsupported":
      return "Dictado no disponible en este navegador";
    case "insecure-context":
      return "Dictado no disponible: se requiere HTTPS";
    case "starting":
      return "Iniciando dictado";
    case "listening":
      return "Detener dictado";
    case "stopping":
      return "Deteniendo dictado";
    case "error":
      return "Reintentar dictado por voz";
    case "idle":
    default:
      return "Dictado por voz";
  }
}

/**
 * Cinematic explore search field (multiline + voice).
 * Filtering / consent semantics stay owned by ExploreView.
 */
export function SearchBox({
  query,
  setQuery,
  setConsent,
  listening,
  setListening,
  focused,
  setFocused,
  compact,
}: SearchBoxProps) {
  const liveId = useId();
  const [micState, setMicState] = useState<MicState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [capabilityReady, setCapabilityReady] = useState(false);

  const recognitionRef = useRef<SpeechRec | null>(null);
  const queryRef = useRef(query);
  const wantListeningRef = useRef(false);
  const restartingRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const processedFinalIndexesRef = useRef<Set<number>>(new Set());
  const mountedRef = useRef(true);
  const micStateRef = useRef<MicState>(micState);
  const setListeningRef = useRef(setListening);
  setListeningRef.current = setListening;
  micStateRef.current = micState;
  queryRef.current = query;

  function clearRestartTimer() {
    if (restartTimerRef.current === null) return;
    window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
  }

  const voiceBusy =
    micState === "starting" ||
    micState === "listening" ||
    micState === "stopping";
  const expanded = focused || voiceBusy || listening || query.length > 0;
  const micUnavailable =
    micState === "unsupported" || micState === "insecure-context";

  function clearRecognitionHandlers(rec: SpeechRec) {
    rec.onstart = null;
    rec.onresult = null;
    rec.onend = null;
    rec.onerror = null;
  }

  function disposeRecognition(mode: "abort" | "stop" = "abort") {
    const rec = recognitionRef.current;
    if (!rec) return;
    clearRecognitionHandlers(rec);
    recognitionRef.current = null;
    processedFinalIndexesRef.current = new Set();
    try {
      if (mode === "stop") rec.stop();
      else rec.abort();
    } catch {
      try {
        if (mode === "stop") rec.abort();
        else rec.stop();
      } catch {
        /* already stopped */
      }
    }
  }

  function finishError(message: string) {
    wantListeningRef.current = false;
    restartingRef.current = false;
    clearRestartTimer();
    setListeningRef.current(false);
    setMicState("error");
    setStatusMessage(message);
  }

  function stopDictation(opts?: { message?: string; silent?: boolean }) {
    const wasActive =
      wantListeningRef.current ||
      micStateRef.current === "starting" ||
      micStateRef.current === "listening" ||
      micStateRef.current === "stopping";

    wantListeningRef.current = false;
    restartingRef.current = false;
    clearRestartTimer();

    if (!wasActive && !recognitionRef.current) {
      setListeningRef.current(false);
      if (opts?.message) setStatusMessage(opts.message);
      return;
    }

    setMicState("stopping");
    if (!opts?.silent) {
      setStatusMessage(opts?.message ?? "Dictado detenido.");
    }

    const rec = recognitionRef.current;
    if (rec) {
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
      processedFinalIndexesRef.current = new Set();
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          /* already stopped */
        }
      }
    }

    setListeningRef.current(false);
    setMicState((prev) =>
      prev === "unsupported" || prev === "insecure-context" ? prev : "idle"
    );
  }

  function startDictation() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      finishError("Tu navegador no admite dictado por voz.");
      setMicState("unsupported");
      return;
    }
    if (!window.isSecureContext) {
      finishError(
        "El dictado requiere HTTPS o un contexto seguro. Puedes seguir escribiendo."
      );
      setMicState("insecure-context");
      return;
    }

    disposeRecognition("abort");
    clearRestartTimer();
    // Fresh index ledger for this recognition instance (allows legitimate repeats).
    processedFinalIndexesRef.current = new Set();
    wantListeningRef.current = true;
    setMicState("starting");
    setStatusMessage("Iniciando dictado…");
    setFocused(true);
    // Parent `listening` stays false until onstart confirms.

    const rec = new Ctor();
    const processedFinals = processedFinalIndexesRef.current;
    rec.lang = "es-ES";
    // iOS/WebKit is more stable with short non-continuous sessions + controlled restart.
    rec.continuous = !isAppleMobileUa();
    rec.interimResults = true;

    rec.onstart = () => {
      if (
        !mountedRef.current ||
        recognitionRef.current !== rec ||
        !wantListeningRef.current
      ) {
        return;
      }
      setMicState("listening");
      setListeningRef.current(true);
      setStatusMessage("Escuchando…");
    };

    rec.onresult = (event) => {
      if (recognitionRef.current !== rec) return;
      let chunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result?.isFinal) continue;
        // Same final index within this instance must only commit once.
        if (processedFinals.has(i)) continue;
        processedFinals.add(i);
        const piece = result[0]?.transcript?.trim() ?? "";
        if (piece) chunk = chunk ? `${chunk} ${piece}` : piece;
      }
      if (!chunk) return;
      const current = queryRef.current.trim();
      setQuery(current ? `${current} ${chunk}` : chunk);
    };

    rec.onerror = (event) => {
      const code = event.error ?? "";
      if (code === "aborted") return;

      const message = messageForErrorCode(code);
      const fatal =
        code === "not-allowed" ||
        code === "service-not-allowed" ||
        code === "audio-capture";

      wantListeningRef.current = false;
      restartingRef.current = false;
      clearRestartTimer();

      if (recognitionRef.current === rec) {
        clearRecognitionHandlers(rec);
        recognitionRef.current = null;
      }

      if (fatal || code === "network" || code === "no-speech" || message) {
        finishError(message || "No se pudo completar el dictado.");
      }
    };

    rec.onend = () => {
      if (recognitionRef.current === rec) {
        clearRecognitionHandlers(rec);
        recognitionRef.current = null;
      }

      if (!wantListeningRef.current) {
        restartingRef.current = false;
        clearRestartTimer();
        setListeningRef.current(false);
        setMicState((prev) => {
          if (
            prev === "unsupported" ||
            prev === "insecure-context" ||
            prev === "error"
          ) {
            return prev;
          }
          return "idle";
        });
        return;
      }

      // Engine ended the session (pause / platform limit). Restart once safely.
      if (restartingRef.current || restartTimerRef.current !== null) return;
      restartingRef.current = true;
      setMicState("starting");
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        restartingRef.current = false;
        if (!mountedRef.current || !wantListeningRef.current) return;
        startDictation();
      }, 140);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      recognitionRef.current = null;
      finishError("No se pudo iniciar el dictado.");
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    const Ctor = getSpeechRecognitionCtor();
    const secure = window.isSecureContext;
    // Support = SpeechRecognition ctor. Secure context is independent.
    // mediaDevices is not a gate and getUserMedia is never required to start.

    if (!Ctor) {
      setMicState("unsupported");
    } else if (!secure) {
      // SpeechRecognition on LAN HTTP is blocked by the browser; do not bypass.
      setMicState("insecure-context");
    } else {
      setMicState("idle");
    }

    if (pendingDictationNotice) {
      setStatusMessage(pendingDictationNotice);
      pendingDictationNotice = null;
    } else if (!Ctor) {
      setStatusMessage("Tu navegador no admite dictado por voz.");
    } else if (!secure) {
      setStatusMessage(
        "El dictado requiere HTTPS o un contexto seguro. Puedes seguir escribiendo."
      );
    }

    // Orphan parent flag after remount (previous instance torn down mid-listen).
    if (listening) {
      setListeningRef.current(false);
    }

    setCapabilityReady(true);

    return () => {
      const active =
        wantListeningRef.current ||
        micStateRef.current === "starting" ||
        micStateRef.current === "listening" ||
        micStateRef.current === "stopping" ||
        Boolean(recognitionRef.current) ||
        restartTimerRef.current !== null;

      mountedRef.current = false;
      wantListeningRef.current = false;
      restartingRef.current = false;
      clearRestartTimer();
      disposeRecognition("abort");
      setListeningRef.current(false);

      if (active) {
        pendingDictationNotice =
          "Dictado detenido al cambiar de vista. Puedes volver a activarlo.";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  function onMicClick() {
    if (!capabilityReady) return;

    if (micState === "unsupported") {
      setStatusMessage("Tu navegador no admite dictado por voz.");
      return;
    }

    if (micState === "insecure-context") {
      setStatusMessage(
        "El dictado requiere HTTPS o un contexto seguro. Puedes seguir escribiendo."
      );
      return;
    }

    if (
      micState === "starting" ||
      micState === "listening" ||
      micState === "stopping" ||
      wantListeningRef.current
    ) {
      stopDictation({ message: "Dictado detenido." });
      return;
    }

    // idle or error → start
    setStatusMessage("");
    startDictation();
  }

  const showMicOff = micUnavailable || micState === "error";
  const showLoader = micState === "starting" || micState === "stopping";

  return (
    <div className={cn(compact && "w-full")}>
      {/*
        Height is animated via CSS (`h-14` ↔ `h-24`), not via toggling `rows`.
        Fixed rows keeps the DOM stable (focus / iOS keyboard) while overflow
        handles long text inside the expanded field.
      */}
      <div
        className={cn(
          "flex items-start overflow-hidden rounded-2xl border shadow-card backdrop-blur-md",
          /* Desktop: solid surface. Mobile: dark frosted glass over the map. */
          "bg-surface/95",
          "max-lg:border-white/10 max-lg:bg-bg/55 max-lg:shadow-none max-lg:backdrop-blur-xl",
          "motion-safe:transition-[height,border-color,box-shadow,background-color] motion-safe:duration-base motion-safe:ease-out motion-reduce:transition-none",
          expanded
            ? "h-24 border-border-brand shadow-brand-glow max-lg:border-border-brand"
            : "h-14 border-border max-lg:border-white/10"
        )}
      >
        <textarea
          value={query}
          rows={3}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!query && !listening && !voiceBusy) setFocused(false);
          }}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (!hasClinicalTerms(next)) setConsent(false);
          }}
          placeholder="¿Qué quieres entrenar?"
          aria-label="Buscar entrenamientos"
          aria-describedby={statusMessage ? liveId : undefined}
          className={cn(
            "box-border h-full min-h-0 w-full min-w-0 flex-1 resize-none overflow-y-auto",
            "bg-transparent px-5 text-base text-fg outline-none",
            "placeholder:text-fg-faint",
            "motion-safe:transition-[padding] motion-safe:duration-base motion-reduce:transition-none",
            expanded ? "py-4" : "py-3.5 leading-[1.75rem]"
          )}
        />
        <div className="relative m-1.5 flex shrink-0 flex-col items-center self-start">
          <Button
            type="button"
            variant={
              micState === "error"
                ? "danger"
                : micUnavailable
                  ? "secondary"
                  : "primary"
            }
            size="sm"
            iconOnly
            aria-label={ariaLabelForState(micState)}
            aria-pressed={micState === "listening" || micState === "starting"}
            aria-describedby={statusMessage ? liveId : undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onMicClick}
            className={cn(
              "rounded-full",
              micState === "listening" && "border-transparent",
              micState === "starting" && "opacity-90",
              micState === "stopping" && "opacity-80"
            )}
            style={
              micState === "listening"
                ? {
                    backgroundColor: "var(--evry-fg)",
                    color: "var(--evry-on-brand)",
                  }
                : undefined
            }
          >
            {showLoader ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : showMicOff ? (
              <MicOff className="h-4 w-4" aria-hidden />
            ) : (
              <Mic
                className={cn(
                  "h-4 w-4",
                  micState === "listening" && "motion-safe:animate-pulse"
                )}
                aria-hidden
              />
            )}
          </Button>
        </div>
      </div>
      <p
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "px-2 text-xs",
          statusMessage ? "pt-1.5" : "sr-only",
          micState === "error" ? "text-danger" : "text-fg-subtle"
        )}
      >
        {statusMessage}
      </p>
    </div>
  );
}
