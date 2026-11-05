"use client";

import { useState, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  NotificationsPanel,
  type AppNotification,
} from "@/components/notifications-panel";

export function AppHeader({
  onExit,
  notifications,
  trailing,
}: {
  onExit: () => void;
  notifications: AppNotification[];
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 px-4 py-3 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-md items-center justify-between">
        <button type="button" onClick={onExit} aria-label="Volver al inicio">
          <Logo />
        </button>

        <div className="flex items-center gap-2">
          {trailing}
          <div className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A] text-zinc-300 transition hover:border-[#A3E635]/40 hover:text-[#A3E635]"
            >
              <Bell className="h-4.5 w-4.5" strokeWidth={1.9} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#A3E635] ring-2 ring-[#050505]" />
              )}
            </button>
            <NotificationsPanel
              open={open}
              onClose={() => setOpen(false)}
              items={notifications}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
