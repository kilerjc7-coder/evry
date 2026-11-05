import { Award } from "lucide-react";

const LEVELS = [
  { name: "Bronce", perk: "Reservas y mapa", unlocked: true },
  { name: "Plata", perk: "Prioridad si se libera una plaza", unlocked: true },
  { name: "Oro", perk: "Mitad de precio al repetir", unlocked: false },
  { name: "Platino", perk: "Una sesión de regalo", unlocked: false },
];

export function LoyaltyView() {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#A3E635]">Plata</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Camino a Oro
            </h2>
          </div>
          <Award className="h-7 w-7 text-[#A3E635]" />
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-3/4 rounded-full bg-[#A3E635]" />
        </div>
        <p className="mt-3 text-sm text-zinc-400">9 de 12 sesiones</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LEVELS.map((level) => (
          <div
            key={level.name}
            className={`rounded-[24px] p-4 ${
              level.unlocked
                ? "border border-[#A3E635]/50 bg-[#0A0A0A]"
                : "border border-white/10 bg-[#0A0A0A] opacity-60"
            }`}
          >
            <p className="text-sm font-semibold text-[#A3E635]">{level.name}</p>
            <p className="mt-2 text-sm text-zinc-300">{level.perk}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
