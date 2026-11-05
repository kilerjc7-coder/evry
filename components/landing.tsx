"use client";

import { PersonStanding, ShieldCheck } from "lucide-react";

export type Role = "athlete" | "pro";

export function Landing({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(163,230,53,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-[36px] bg-[#A3E635] text-6xl font-black tracking-tighter text-black shadow-[0_0_64px_rgba(163,230,53,0.4)] transition-transform duration-500 hover:scale-[1.02]">
          E
        </div>
        <h1 className="mt-8 text-6xl font-semibold tracking-tighter text-white">
          EVRY
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-500">
          Entrena cerca. Reserva con créditos.
        </p>

        <div className="mt-16 flex w-full flex-col gap-4">
          <button
            type="button"
            onClick={() => onSelect("athlete")}
            className="group flex h-24 items-center gap-4 rounded-[28px] bg-[#A3E635] px-6 text-left transition duration-200 active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/10">
              <PersonStanding className="h-7 w-7 text-black" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-lg font-semibold text-black">
                Iniciar como Deportista
              </span>
              <span className="mt-0.5 block text-sm text-black/60">
                Explora y reserva sesiones
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("pro")}
            className="group flex h-24 items-center gap-4 rounded-[28px] border border-[#A3E635]/40 bg-[#0A0A0A] px-6 text-left transition duration-200 hover:border-[#A3E635]/70 active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#A3E635]/30 bg-[#121212]">
              <ShieldCheck className="h-7 w-7 text-[#A3E635]" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-lg font-semibold text-white">
                Iniciar como Profesional
              </span>
              <span className="mt-0.5 block text-sm text-zinc-500">
                Gestiona tu negocio
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
