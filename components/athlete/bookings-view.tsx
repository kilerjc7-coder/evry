"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { MiniCalendar, toKey } from "@/components/mini-calendar";

type Booking = {
  id: string;
  title: string;
  trainer: string;
  place: string;
  time: string;
  dateKey: string;
  credits: number;
};

const BOOKINGS: Booking[] = [
  {
    id: "b1",
    title: "Core en casa",
    trainer: "Juan Carlos Raya",
    place: "Online",
    time: "19:30",
    dateKey: "2026-11-05",
    credits: 8,
  },
  {
    id: "b2",
    title: "Movilidad y core",
    trainer: "Carlos Ruiz",
    place: "María Luisa",
    time: "10:00",
    dateKey: "2026-11-07",
    credits: 12,
  },
  {
    id: "b3",
    title: "HIIT junto al río",
    trainer: "Laura Méndez",
    place: "Ribera",
    time: "19:00",
    dateKey: "2026-11-09",
    credits: 10,
  },
  {
    id: "b4",
    title: "Fuerza y dominadas",
    trainer: "Álvaro Trejo",
    place: "Alamillo",
    time: "18:30",
    dateKey: "2026-11-10",
    credits: 15,
  },
];

export function BookingsView() {
  const marked = useMemo(() => BOOKINGS.map((b) => b.dateKey), []);
  const [selected, setSelected] = useState<Date | null>(() => new Date(2026, 10, 5));

  const selectedKey = selected ? toKey(selected) : null;

  const upcoming = useMemo(() => {
    if (!selectedKey) return BOOKINGS;
    const filtered = BOOKINGS.filter((b) => b.dateKey === selectedKey);
    return filtered.length > 0 ? filtered : BOOKINGS;
  }, [selectedKey]);

  const dayHasBookings =
    selectedKey != null && BOOKINGS.some((b) => b.dateKey === selectedKey);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 text-[#A3E635]">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Tu agenda
          </span>
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
          Mis Reservas
        </h2>
      </div>

      <MiniCalendar
        markedDates={marked}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="space-y-3">
        <p className="px-1 text-sm text-zinc-500">
          {dayHasBookings
            ? "Sesiones del día seleccionado"
            : "Próximas sesiones reservadas"}
        </p>

        {upcoming.map((booking) => (
          <article
            key={booking.id}
            className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {booking.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{booking.trainer}</p>
              </div>
              <p className="text-sm font-semibold text-[#A3E635]">
                {booking.credits} Cr
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#A3E635]" />
                {booking.dateKey}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#A3E635]" />
                {booking.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#A3E635]" />
                {booking.place}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
