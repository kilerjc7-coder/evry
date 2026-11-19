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
import { cn } from "@/lib/cn";

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
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[#050505] text-white",
        /* Desktop: lock shell to the viewport so flex children get a definite
           height under the header (avoids document growth from session cards). */
        "lg:h-dvh lg:max-h-dvh lg:overflow-hidden"
      )}
    >
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

      {/*
        Desktop: flex-1 + min-h-0 fills the space below the in-flow header.
        Explore locks overflow; other tabs may scroll inside main.
      */}
      <main
        className={cn(
          "mx-auto w-full max-w-md px-4 pt-5",
          /*
            Mobile: clear fixed BottomNav.
            Nav chrome ≈ pt-2 + icon/label column + border (~4.5–5.5rem) plus
            its own env(safe-area-inset-bottom). pb-28 ignored the inset, so
            CTAs could sit under the home indicator. Keep ≥7rem, grow with inset.
            Desktop: lg:pb-8 replaces this (BottomNav is lg:hidden).
          */
          "pb-[max(7rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))]",
          "lg:flex lg:max-w-7xl lg:min-h-0 lg:flex-1 lg:flex-col lg:px-6 lg:pt-6 lg:pb-8",
          tab === "explorar" ? "lg:overflow-hidden" : "lg:overflow-y-auto"
        )}
      >
        {tab === "explorar" && (
          <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
            <ExploreView
              credits={credits}
              onBook={(price) => {
                if (credits < price) return false;
                setCredits((current) => current - price);
                return true;
              }}
            />
          </div>
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
