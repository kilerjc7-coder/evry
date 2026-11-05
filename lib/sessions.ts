import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Flame,
  Leaf,
  StretchHorizontal,
  Trees,
} from "lucide-react";

export type ChipId = "intensidad" | "movilidad" | "fuerza" | "aire" | "suave";

export type Session = {
  id: string;
  title: string;
  trainer: string;
  cafyd: boolean;
  place: string;
  time: string;
  priceCredits: number;
  chips: ChipId[];
  x: number;
  y: number;
  dateKey?: string;
};

export const CHIPS: {
  id: ChipId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "intensidad", label: "Alta intensidad", icon: Flame },
  { id: "movilidad", label: "Movilidad", icon: StretchHorizontal },
  { id: "fuerza", label: "Fuerza", icon: Dumbbell },
  { id: "aire", label: "Al aire libre", icon: Trees },
  { id: "suave", label: "Suave", icon: Leaf },
];

export const SESSIONS: Session[] = [
  {
    id: "1",
    title: "Movilidad y core",
    trainer: "Carlos Ruiz",
    cafyd: true,
    place: "María Luisa",
    time: "Sáb 10:00",
    priceCredits: 12,
    chips: ["movilidad", "suave", "aire"],
    x: 30,
    y: 68,
    dateKey: "2026-11-07",
  },
  {
    id: "2",
    title: "Fuerza y dominadas",
    trainer: "Álvaro Trejo",
    cafyd: true,
    place: "Alamillo",
    time: "Mar y jue 18:30",
    priceCredits: 15,
    chips: ["fuerza", "intensidad", "aire"],
    x: 62,
    y: 30,
    dateKey: "2026-11-10",
  },
  {
    id: "3",
    title: "Core en casa",
    trainer: "Juan Carlos Raya",
    cafyd: true,
    place: "Online",
    time: "Hoy 19:30",
    priceCredits: 8,
    chips: ["movilidad", "suave"],
    x: 74,
    y: 58,
    dateKey: "2026-11-05",
  },
  {
    id: "4",
    title: "HIIT junto al río",
    trainer: "Laura Méndez",
    cafyd: false,
    place: "Ribera",
    time: "Lun 19:00",
    priceCredits: 10,
    chips: ["intensidad", "aire"],
    x: 46,
    y: 46,
    dateKey: "2026-11-09",
  },
  {
    id: "5",
    title: "Fuerza funcional",
    trainer: "Pablo Sanz",
    cafyd: false,
    place: "Nervión",
    time: "Vie 18:00",
    priceCredits: 11,
    chips: ["fuerza", "intensidad"],
    x: 54,
    y: 74,
    dateKey: "2026-11-13",
  },
];
