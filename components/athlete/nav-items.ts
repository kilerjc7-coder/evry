import {
  Award,
  CalendarCheck2,
  Coins,
  Compass,
  UserRound,
} from "lucide-react";
import type { NavItem } from "@/components/bottom-nav";

export type AthleteTab =
  | "explorar"
  | "reservas"
  | "monedero"
  | "lealtad"
  | "perfil";

/** Shared Athlete nav catalog for BottomNav (mobile) and SideNav (desktop). */
export const ATHLETE_NAV_ITEMS: NavItem<AthleteTab>[] = [
  { id: "explorar", label: "Explorar", icon: Compass },
  { id: "reservas", label: "Mis Reservas", icon: CalendarCheck2 },
  { id: "monedero", label: "Monedero", icon: Coins },
  { id: "lealtad", label: "Lealtad", icon: Award },
  { id: "perfil", label: "Perfil", icon: UserRound },
];
