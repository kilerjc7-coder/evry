"use client";

import { useState, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  NotificationsPanel,
  type AppNotification,
} from "@/components/notifications-panel";
import { cn } from "@/lib/cn";

export function AppHeader({
  onExit,
  notifications,
  trailing,
  inert,
  /** xl+: logo rail matches SideNav width (248px); mobile/lg unchanged. */
  alignWithSideNav = false,
}: {
  onExit: () => void;
  notifications: AppNotification[];
  trailing?: ReactNode;
  /** When set, header chrome is non-interactive (e.g. Sheet open). */
  inert?: boolean;
  alignWithSideNav?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header
      inert={inert || undefined}
      className={cn(
        "sticky top-0 z-[100] isolate border-b border-white/10 bg-[#050505]/90 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur-md lg:px-6",
        alignWithSideNav && "xl:px-0"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-md items-center justify-between lg:max-w-7xl",
          alignWithSideNav && "xl:mx-0 xl:max-w-none xl:w-full"
        )}
      >
        <div
          className={cn(
            alignWithSideNav &&
              "xl:flex xl:w-[248px] xl:shrink-0 xl:items-center xl:px-3"
          )}
        >
          <button type="button" onClick={onExit} aria-label="Volver al inicio">
            <Logo />
          </button>
        </div>

        <div
          className={cn(
            "flex items-center gap-2",
            alignWithSideNav && "xl:flex-1 xl:justify-end xl:pr-6"
          )}
        >
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
