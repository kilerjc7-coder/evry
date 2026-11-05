"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LayoutDashboard, UserRound } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { PRO_NOTIFICATIONS } from "@/components/notifications-panel";
import { ToastStack, type ToastMessage } from "@/components/toast";
import { ClassesView } from "@/components/pro/classes-view";
import { DashboardView } from "@/components/pro/dashboard-view";
import { ProProfileView } from "@/components/pro/profile-view";

type ProTab = "panel" | "clases" | "perfil";

const ITEMS = [
  { id: "panel" as const, label: "Panel", icon: LayoutDashboard },
  { id: "clases" as const, label: "Mis Clases", icon: CalendarDays },
  { id: "perfil" as const, label: "Perfil", icon: UserRound },
];

export function ProApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<ProTab>("panel");
  const [choice, setChoice] = useState<"full" | "waitlist" | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToasts([
        {
          id: "rescue-12h",
          title: "Umbral de 12 horas",
          body: "Falta 1 plaza para Movilidad y core. Revisa el panel para decidir.",
          tone: "urgent",
        },
      ]);
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((t) => t.id !== id));
  }

  function handleRescue(next: "full" | "waitlist") {
    setChoice(next);
    setToasts((current) => [
      ...current.filter((t) => t.id !== "rescue-12h"),
      {
        id: `rescue-done-${next}`,
        title:
          next === "full"
            ? "Clase confirmada al 100%"
            : "Lista de espera promocionada",
        body:
          next === "full"
            ? "Comisión EVRY al 0%. Impartes cobrando el íntegro."
            : "Becas de créditos enviadas a Oro/Platino en espera.",
        tone: "success",
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AppHeader
        onExit={onExit}
        notifications={PRO_NOTIFICATIONS}
        trailing={<p className="pr-1 text-sm text-zinc-400">Carlos Ruiz</p>}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main className="mx-auto max-w-md px-4 pb-28 pt-5">
        {tab === "panel" && (
          <DashboardView rescueChoice={choice} onRescue={handleRescue} />
        )}
        {tab === "clases" && <ClassesView />}
        {tab === "perfil" && <ProProfileView onLogout={onExit} />}
      </main>

      <BottomNav items={ITEMS} active={tab} onChange={setTab} />
    </div>
  );
}
