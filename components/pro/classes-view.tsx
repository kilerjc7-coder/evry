"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Copy,
  MapPin,
  Plus,
} from "lucide-react";
import { MiniCalendar, toKey } from "@/components/mini-calendar";

export type ClassSession = {
  id: string;
  title: string;
  time: string;
  place: string;
  price: string;
  dateKey: string;
};

const INITIAL: ClassSession[] = [
  {
    id: "movilidad",
    title: "Movilidad y core",
    time: "10:00",
    place: "María Luisa",
    price: "12 Cr",
    dateKey: "2026-11-07",
  },
  {
    id: "fuerza",
    title: "Fuerza funcional",
    time: "18:00",
    place: "Nervión",
    price: "14 Cr",
    dateKey: "2026-11-08",
  },
  {
    id: "hiit",
    title: "HIIT outdoor",
    time: "19:00",
    place: "Ribera",
    price: "11 Cr",
    dateKey: "2026-11-09",
  },
  {
    id: "core",
    title: "Core en casa",
    time: "19:30",
    place: "Online",
    price: "8 Cr",
    dateKey: "2026-11-10",
  },
  {
    id: "movilidad-2",
    title: "Movilidad avanzada",
    time: "09:00",
    place: "Alamillo",
    price: "13 Cr",
    dateKey: "2026-11-12",
  },
  {
    id: "fuerza-2",
    title: "Dominadas progresivas",
    time: "18:30",
    place: "Alamillo",
    price: "15 Cr",
    dateKey: "2026-11-13",
  },
];

const PREVIEW = 3;

type Draft = {
  title: string;
  time: string;
  place: string;
  price: string;
  date: string;
};

const EMPTY: Draft = {
  title: "",
  time: "",
  place: "",
  price: "",
  date: "",
};

export function ClassesView() {
  const [classes, setClasses] = useState<ClassSession[]>(INITIAL);
  const [selected, setSelected] = useState<Date | null>(
    () => new Date(2026, 10, 7)
  );
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const marked = useMemo(() => classes.map((c) => c.dateKey), [classes]);

  const sorted = useMemo(
    () => [...classes].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [classes]
  );

  const visible = showAll ? sorted : sorted.slice(0, PREVIEW);

  function openCreate() {
    setTemplateMode(false);
    setTemplateId(null);
    setDraft(EMPTY);
    setCreating(true);
  }

  function openTemplate() {
    setTemplateMode(true);
    setTemplateId(null);
    setDraft(EMPTY);
    setCreating(true);
  }

  function applyTemplate(id: string) {
    const source = classes.find((c) => c.id === id);
    if (!source) return;
    setTemplateId(id);
    setDraft({
      title: source.title,
      time: "",
      place: source.place,
      price: source.price.replace(" Cr", ""),
      date: "",
    });
  }

  function publish() {
    if (!draft.title.trim()) return;
    if (templateMode && (!draft.date.trim() || !draft.time.trim())) return;

    setClasses((current) => [
      {
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        time: draft.time.trim() || "Por confirmar",
        place: draft.place.trim() || "Por confirmar",
        price: draft.price.trim() ? `${draft.price.trim()} Cr` : "—",
        dateKey: draft.date.trim() || toKey(new Date()),
      },
      ...current,
    ]);
    setDraft(EMPTY);
    setCreating(false);
    setTemplateMode(false);
    setTemplateId(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#A3E635]">
          Agenda
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
          Mis Clases
        </h2>
      </div>

      <MiniCalendar
        markedDates={marked}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={openCreate}
          className="flex h-14 items-center justify-center gap-2 rounded-[22px] bg-[#A3E635] text-sm font-semibold text-black transition active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          Crear Nueva Sesión
        </button>
        <button
          type="button"
          onClick={openTemplate}
          className="flex h-14 items-center justify-center gap-2 rounded-[22px] border border-[#A3E635]/40 text-sm font-semibold text-[#A3E635] transition hover:bg-[#A3E635]/5 active:scale-[0.99]"
        >
          <Copy className="h-4 w-4" />
          Usar Plantilla / Sesión Recurrente
        </button>
      </div>

      {creating && (
        <form
          className="space-y-3 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5"
          onSubmit={(event) => {
            event.preventDefault();
            publish();
          }}
        >
          {templateMode && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">
                Selecciona una sesión plantilla
              </p>
              <div className="space-y-2">
                {classes.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyTemplate(item.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                      templateId === item.id
                        ? "border-[#A3E635] bg-[#A3E635]/10 text-[#A3E635]"
                        : "border-white/10 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-xs text-zinc-500">{item.place}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!templateMode && (
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              placeholder="Nombre de la sesión"
              className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none focus:border-[#A3E635]/50"
            />
          )}

          {templateMode && templateId && (
            <p className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-300">
              Plantilla:{" "}
              <span className="font-medium text-white">{draft.title}</span>
              <span className="mt-1 block text-xs text-zinc-500">
                Solo indica nueva fecha y hora
              </span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={draft.date}
              onChange={(event) =>
                setDraft({ ...draft, date: event.target.value })
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-black px-3 text-sm outline-none focus:border-[#A3E635]/50 [color-scheme:dark]"
            />
            <input
              type="time"
              value={draft.time}
              onChange={(event) =>
                setDraft({ ...draft, time: event.target.value })
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-black px-3 text-sm outline-none focus:border-[#A3E635]/50 [color-scheme:dark]"
            />
          </div>

          {!templateMode && (
            <>
              <input
                value={draft.place}
                onChange={(event) =>
                  setDraft({ ...draft, place: event.target.value })
                }
                placeholder="Lugar"
                className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none focus:border-[#A3E635]/50"
              />
              <input
                value={draft.price}
                onChange={(event) =>
                  setDraft({ ...draft, price: event.target.value })
                }
                placeholder="Precio en créditos"
                inputMode="numeric"
                className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none focus:border-[#A3E635]/50"
              />
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setTemplateMode(false);
              }}
              className="h-12 flex-1 rounded-2xl border border-white/10 text-sm text-zinc-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 flex-1 rounded-2xl bg-white text-sm font-semibold text-black"
            >
              Publicar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <p className="px-1 text-sm text-zinc-500">Próximas sesiones</p>
        {visible.map((item) => (
          <article
            key={item.id}
            className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-base font-semibold text-[#A3E635]">
                {item.price}
              </p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-[#A3E635]" />
                {item.dateKey} · {item.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#A3E635]" />
                {item.place}
              </span>
            </div>
          </article>
        ))}

        {sorted.length > PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 text-sm font-medium text-zinc-400 transition hover:border-[#A3E635]/30 hover:text-[#A3E635]"
          >
            {showAll ? "Ver menos" : "Ver todas"}
            <ChevronDown
              className={`h-4 w-4 transition ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
