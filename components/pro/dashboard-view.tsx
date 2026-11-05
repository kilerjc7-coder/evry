"use client";

import { Star, TrendingUp, UserPlus, Wallet } from "lucide-react";

export function DashboardView({
  rescueChoice,
  onRescue,
}: {
  rescueChoice: "full" | "waitlist" | null;
  onRescue: (choice: "full" | "waitlist") => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#A3E635]">
          Resumen
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
          Panel
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-[28px] border border-[#A3E635]/30 bg-[#0A0A0A] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Ingresos Stripe</p>
            <Wallet className="h-4 w-4 text-[#A3E635]" />
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[#A3E635]">
            1.250 €
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
            <TrendingUp className="h-3 w-3 text-[#A3E635]" />
            +18% vs. mes anterior
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Nuevos clientes</p>
            <UserPlus className="h-3.5 w-3.5 text-[#A3E635]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">12</p>
          <p className="mt-1 text-[11px] text-zinc-600">este mes</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Valoración</p>
            <Star className="h-3.5 w-3.5 text-[#A3E635]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">4.9</p>
          <p className="mt-1 text-[11px] text-zinc-600">48 comentarios</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#A3E635] bg-[#0A0A0A] p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#A3E635]">
          Umbral de 12 horas
        </p>
        <p className="mt-2 text-lg font-semibold leading-snug text-white">
          Falta 1 plaza para tu clase. ¿Qué deseas hacer?
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Movilidad y core · Sáb 10:00 · María Luisa
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onRescue("full")}
            className="h-12 w-full rounded-2xl bg-[#A3E635] text-sm font-semibold text-black transition active:scale-[0.99]"
          >
            Impartir cobrando 100%
          </button>
          <button
            type="button"
            onClick={() => onRescue("waitlist")}
            className="h-12 w-full rounded-2xl border border-[#A3E635]/40 text-sm font-semibold text-[#A3E635] transition hover:bg-[#A3E635]/5 active:scale-[0.99]"
          >
            Promocionar a usuarios en lista de espera
          </button>
        </div>
        {rescueChoice && (
          <p className="mt-3 text-sm text-[#A3E635]">
            {rescueChoice === "full"
              ? "Comisión EVRY al 0%. Clase confirmada."
              : "Becas promocionales enviadas a lista de espera."}
          </p>
        )}
      </div>
    </div>
  );
}
