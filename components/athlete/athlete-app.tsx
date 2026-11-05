"use client";

import { useState } from "react";
import {
  Award,
  CalendarCheck2,
  Coins,
  Compass,
  UserRound,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { ATHLETE_NOTIFICATIONS } from "@/components/notifications-panel";
import { BookingsView } from "@/components/athlete/bookings-view";
import { ExploreView } from "@/components/athlete/explore-view";
import { LoyaltyView } from "@/components/athlete/loyalty-view";
import { AthleteProfileView } from "@/components/athlete/profile-view";
import { WalletView } from "@/components/athlete/wallet-view";

type AthleteTab =
  | "explorar"
  | "reservas"
  | "monedero"
  | "lealtad"
  | "perfil";

const ITEMS = [
  { id: "explorar" as const, label: "Explorar", icon: Compass },
  { id: "reservas" as const, label: "Mis Reservas", icon: CalendarCheck2 },
  { id: "monedero" as const, label: "Monedero", icon: Coins },
  { id: "lealtad" as const, label: "Lealtad", icon: Award },
  { id: "perfil" as const, label: "Perfil", icon: UserRound },
];

export function AthleteApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<AthleteTab>("explorar");
  const [credits, setCredits] = useState(350);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AppHeader
        onExit={onExit}
        notifications={ATHLETE_NOTIFICATIONS}
        trailing={
          <button
            type="button"
            onClick={() => setTab("monedero")}
            className="rounded-full border border-[#A3E635]/40 bg-[#0A0A0A] px-3 py-1.5 text-sm font-semibold"
          >
            <span className="text-[#A3E635]">{credits}</span> Cr
          </button>
        }
      />

      <main className="mx-auto max-w-md px-4 pb-28 pt-5">
        {tab === "explorar" && (
          <ExploreView
            credits={credits}
            onBook={(price) => {
              if (credits < price) return false;
              setCredits((current) => current - price);
              return true;
            }}
          />
        )}
        {tab === "reservas" && <BookingsView />}
        {tab === "monedero" && (
          <WalletView
            credits={credits}
            onBuy={(amount) => setCredits((current) => current + amount)}
          />
        )}
        {tab === "lealtad" && <LoyaltyView />}
        {tab === "perfil" && <AthleteProfileView onLogout={onExit} />}
      </main>

      <BottomNav items={ITEMS} active={tab} onChange={setTab} />
    </div>
  );
}
