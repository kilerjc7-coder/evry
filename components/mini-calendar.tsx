"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MiniCalendar({
  markedDates,
  selected,
  onSelect,
}: {
  markedDates: string[];
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const marked = useMemo(() => new Set(markedDates), [markedDates]);

  const cells = useMemo(() => {
    const total = daysInMonth(cursor);
    const first = startOfMonth(cursor);
    // Monday-first index
    const offset = (first.getDay() + 6) % 7;
    const list: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < offset; i++) {
      list.push({ date: null, key: `e-${i}` });
    }
    for (let day = 1; day <= total; day++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      list.push({ date, key: toKey(date) });
    }
    return list;
  }, [cursor]);

  const label = cursor.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() =>
            setCursor(
              new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-[#A3E635]/40 hover:text-[#A3E635]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-white">{label}</p>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() =>
            setCursor(
              new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-[#A3E635]/40 hover:text-[#A3E635]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-medium text-zinc-600"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (!cell.date) {
            return <div key={cell.key} className="aspect-square" />;
          }
          const isToday = sameDay(cell.date, today);
          const isSelected = selected ? sameDay(cell.date, selected) : false;
          const hasEvent = marked.has(cell.key);

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelect(cell.date!)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition ${
                isSelected
                  ? "bg-[#A3E635] font-semibold text-black"
                  : isToday
                    ? "border border-[#A3E635]/50 text-[#A3E635]"
                    : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              {cell.date.getDate()}
              {hasEvent && (
                <span
                  className={`absolute bottom-1.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-black" : "bg-[#A3E635]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toKey };
