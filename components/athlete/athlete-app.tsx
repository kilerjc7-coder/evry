"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { ATHLETE_NOTIFICATIONS } from "@/components/notifications-panel";
import { BookingsView } from "@/components/athlete/bookings-view";
import { ExploreView } from "@/components/athlete/explore-view";
import { LoyaltyView } from "@/components/athlete/loyalty-view";
import {
  ATHLETE_NAV_ITEMS,
  type AthleteTab,
} from "@/components/athlete/nav-items";
import { AthleteProfileView } from "@/components/athlete/profile-view";
import { SideNav } from "@/components/athlete/side-nav";
import { WalletView } from "@/components/athlete/wallet-view";
import { cn } from "@/lib/cn";

export function AthleteApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<AthleteTab>("explorar");
  const [credits, setCredits] = useState(350);
  /** Single source of truth for MapSessionSheet — ExploreView is controlled. */
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleTabChange(next: AthleteTab) {
    setTab(next);
    /* Explore unmounts on other tabs; clear Sheet so chrome state stays accurate. */
    if (next !== "explorar") setSheetOpen(false);
  }

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[#050505] text-white",
        /* Desktop: lock shell to the viewport so flex children get a definite
           height under the header (avoids document growth from session cards). */
        "lg:h-dvh lg:max-h-dvh lg:overflow-hidden"
      )}
    >
      {/* D3.3.2/C2: inert on header itself — no short wrapper (breaks sticky on iOS). */}
      <AppHeader
        inert={sheetOpen || undefined}
        alignWithSideNav
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
        Under header: SideNav (xl+) beside main.
        lg–xl: BottomNav (no SideNav) so Explorar keeps full width.
        Desktop: flex-1 + min-h-0 fills the space below the in-flow header.
        Explore locks overflow; other tabs may scroll inside main.
        Mobile: SideNav hidden; main keeps prior stacking (BottomNav fixed).
      */}
      <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
        <div
          inert={sheetOpen || undefined}
          className="hidden xl:flex xl:shrink-0 xl:self-stretch"
        >
          <SideNav
            items={ATHLETE_NAV_ITEMS}
            active={tab}
            onChange={handleTabChange}
            className="h-full"
          />
        </div>

        <main
          className={cn(
            "mx-auto w-full max-w-md px-4 pt-5",
            /*
              Clear fixed BottomNav below xl (mobile + lg tablet).
              Nav chrome ≈ pt-2 + icon/label column + border (~4.5–5.5rem) plus
              its own env(safe-area-inset-bottom). pb-28 ignored the inset, so
              CTAs could sit under the home indicator. Keep ≥7rem, grow with inset.
              xl+: SideNav on, BottomNav off → compact pb-8.
            */
            "pb-[max(7rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))]",
            "lg:mx-0 lg:flex lg:max-w-none lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:px-6 lg:pt-6",
            "xl:pb-8",
            tab === "explorar" ? "lg:overflow-hidden" : "lg:overflow-y-auto"
          )}
        >
          {tab === "explorar" && (
            <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
              <ExploreView
                credits={credits}
                sheetOpen={sheetOpen}
                onSheetOpenChange={setSheetOpen}
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
      </div>

      <div inert={sheetOpen || undefined}>
        <BottomNav
          items={ATHLETE_NAV_ITEMS}
          active={tab}
          onChange={handleTabChange}
          /* Visible below xl (with SideNav hidden); Pro keeps default lg:hidden. */
          className="xl:hidden"
        />
      </div>
    </div>
  );
}
