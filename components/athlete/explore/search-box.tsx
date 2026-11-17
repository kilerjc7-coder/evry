"use client";

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";
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
  onresult: ((event: SpeechResultList) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor() {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
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
  const expanded = focused || listening || query.length > 0;
  const recognitionRef = useRef<SpeechRec | null>(null);
  const queryRef = useRef(query);
  const wantListeningRef = useRef(false);
  const restartingRef = useRef(false);
  queryRef.current = query;

  function clearRecognitionHandlers(rec: SpeechRec) {
    rec.onresult = null;
    rec.onend = null;
    rec.onerror = null;
  }

  function disposeRecognition() {
    const rec = recognitionRef.current;
    if (!rec) return;
    clearRecognitionHandlers(rec);
    recognitionRef.current = null;
    try {
      rec.abort();
    } catch {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    }
  }

  function stopDictation() {
    wantListeningRef.current = false;
    restartingRef.current = false;
    disposeRecognition();
    setListening(false);
  }

  function startDictation() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      wantListeningRef.current = false;
      setListening(false);
      return;
    }

    disposeRecognition();

    const rec = new Ctor();
    rec.lang = "es-ES";
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = (event) => {
      let chunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result?.isFinal) continue;
        const piece = result[0]?.transcript?.trim() ?? "";
        if (piece) chunk = chunk ? `${chunk} ${piece}` : piece;
      }
      if (!chunk) return;
      const current = queryRef.current.trim();
      setQuery(current ? `${current} ${chunk}` : chunk);
    };

    rec.onerror = (event) => {
      const code = event.error ?? "";
      // Fatal / permission errors: stop listening for good.
      if (
        code === "not-allowed" ||
        code === "service-not-allowed" ||
        code === "audio-capture"
      ) {
        wantListeningRef.current = false;
        restartingRef.current = false;
        if (recognitionRef.current === rec) {
          clearRecognitionHandlers(rec);
          recognitionRef.current = null;
        }
        setListening(false);
        return;
      }
      // aborted: user or disposeRecognition — onend handles cleanup
      // no-speech / network / etc.: allow onend restart while wantListening
    };

    rec.onend = () => {
      if (recognitionRef.current === rec) {
        clearRecognitionHandlers(rec);
        recognitionRef.current = null;
      }

      if (!wantListeningRef.current) {
        restartingRef.current = false;
        setListening(false);
        return;
      }

      // Browser ended the session (pause / limit). Restart once safely.
      if (restartingRef.current) return;
      restartingRef.current = true;
      window.setTimeout(() => {
        restartingRef.current = false;
        if (!wantListeningRef.current) return;
        startDictation();
      }, 120);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      wantListeningRef.current = false;
      setListening(false);
    }
  }

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      disposeRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only
  }, []);

  return (
    <div
      className={cn(
        "flex items-start rounded-2xl border bg-surface/95 shadow-card backdrop-blur-md",
        "motion-safe:transition-[border-color,box-shadow,min-height] motion-safe:duration-base motion-safe:ease-out motion-reduce:transition-none",
        expanded
          ? "min-h-24 border-border-brand shadow-brand-glow"
          : "min-h-14 border-border",
        compact && "w-full"
      )}
    >
      <textarea
        value={query}
        rows={expanded ? 3 : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!query && !listening) setFocused(false);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          if (!hasClinicalTerms(next)) setConsent(false);
        }}
        placeholder="¿Qué quieres entrenar?"
        aria-label="Buscar entrenamientos"
        className={cn(
          "w-full resize-none bg-transparent px-5 text-base text-fg outline-none",
          "placeholder:text-fg-faint",
          "motion-safe:transition-[padding] motion-safe:duration-base motion-reduce:transition-none",
          expanded ? "py-4" : "py-3.5 leading-[1.75rem]"
        )}
      />
      <Button
        type="button"
        variant="primary"
        size="sm"
        iconOnly
        aria-label={listening ? "Detener dictado" : "Dictado por voz"}
        aria-pressed={listening}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (listening || wantListeningRef.current) {
            stopDictation();
            return;
          }
          setFocused(true);
          wantListeningRef.current = true;
          startDictation();
        }}
        className={cn(
          "m-1.5 shrink-0 rounded-full",
          // Listening styles must not rely on hover; beat primary hover via inline style below.
          listening && "border-transparent"
        )}
        style={
          listening
            ? {
                backgroundColor: "var(--evry-fg)",
                color: "var(--evry-on-brand)",
              }
            : undefined
        }
      >
        <Mic className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
