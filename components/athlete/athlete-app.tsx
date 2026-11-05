"use client";

import { useState } from "react";
import { Award, Coins, Compass } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";
import { ExploreView } from "@/components/athlete/explore-view";
import { LoyaltyView } from "@/components/athlete/loyalty-view";
import { WalletView } from "@/components/athlete/wallet-view";

type AthleteTab = "explorar" | "monedero" | "lealtad";

const ITEMS = [
  { id: "explorar" as const, label: "Explorar", icon: Compass },
  { id: "monedero" as const, label: "Monedero", icon: Coins },
  { id: "lealtad" as const, label: "Lealtad", icon: Award },
];

export function AthleteApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<AthleteTab>("explorar");
  const [credits, setCredits] = useState(350);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={onExit} aria-label="Volver al inicio">
            <Logo />
          </button>
          <button
            type="button"
            onClick={() => setTab("monedero")}
            className="rounded-full border border-[#A3E635]/40 bg-[#0A0A0A] px-3 py-1.5 text-sm font-semibold"
          >
            <span className="text-[#A3E635]">{credits}</span> Cr
          </button>
        </div>
      </header>

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
        {tab === "monedero" && (
          <WalletView
            credits={credits}
            onBuy={(amount) => setCredits((current) => current + amount)}
          />
        )}
        {tab === "lealtad" && <LoyaltyView />}
      </main>

      <BottomNav items={ITEMS} active={tab} onChange={setTab} />
    </div>
  );
}
