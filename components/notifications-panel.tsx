"use client";

import { useEffect, useRef } from "react";
import { Bell, Clock, Star, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  icon?: LucideIcon;
};

export const ATHLETE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "a1",
    title: "Recordatorio de clase",
    body: "Movilidad y core · mañana 10:00 en María Luisa",
    time: "hace 12 min",
    unread: true,
    icon: Clock,
  },
  {
    id: "a2",
    title: "Créditos renovados",
    body: "Tu pack Progresión renueva la vigencia 6 meses",
    time: "hace 2 h",
    unread: true,
    icon: Wallet,
  },
  {
    id: "a3",
    title: "Nueva sesión cerca",
    body: "HIIT junto al río disponible en Ribera",
    time: "ayer",
    icon: Star,
  },
];

export const PRO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "p1",
    title: "Umbral de 12 horas",
    body: "Falta 1 plaza para Movilidad y core · Sáb 10:00",
    time: "ahora",
    unread: true,
    icon: Users,
  },
  {
    id: "p2",
    title: "Nueva valoración",
    body: "Álvaro te ha dejado ★ 5.0 en Fuerza funcional",
    time: "hace 1 h",
    unread: true,
    icon: Star,
  },
  {
    id: "p3",
    title: "Pago Stripe recibido",
    body: "Cobro de 48 € liquidado en tu cuenta Connect",
    time: "hace 3 h",
    icon: Wallet,
  },
];

export function NotificationsPanel({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: AppNotification[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] origin-top-right animate-in fade-in zoom-in-95 overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0A] shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#A3E635]" />
          <p className="text-sm font-semibold text-white">Notificaciones</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          Cerrar
        </button>
      </div>
      <ul className="max-h-80 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon ?? Bell;
          return (
            <li
              key={item.id}
              className="border-b border-white/5 px-4 py-3.5 last:border-0"
            >
              <div className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.unread
                      ? "bg-[#A3E635]/15 text-[#A3E635]"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    {item.unread && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A3E635]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                    {item.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-zinc-600">{item.time}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
