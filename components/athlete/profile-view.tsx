"use client";

import {
  ChevronRight,
  History,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SECTIONS: {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "account",
    label: "Ajustes de cuenta",
    description: "Email, contraseña y seguridad",
    icon: Settings,
  },
  {
    id: "prefs",
    label: "Preferencias de entrenamiento",
    description: "Intensidad, horarios y ubicaciones",
    icon: SlidersHorizontal,
  },
  {
    id: "personal",
    label: "Datos personales",
    description: "Nombre, ciudad y contacto",
    icon: UserRound,
  },
  {
    id: "history",
    label: "Historial",
    description: "Sesiones pasadas y valoraciones",
    icon: History,
  },
];

export function AthleteProfileView({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A3E635] text-2xl font-semibold text-black">
          Á
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Álvaro</h2>
        <p className="mt-1 text-sm text-zinc-500">Sevilla · Nivel Plata</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0A]">
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03] ${
                index < SECTIONS.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A3E635]/10 text-[#A3E635]">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-white">
                  {section.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {section.description}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-medium text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
