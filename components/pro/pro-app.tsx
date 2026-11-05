"use client";

import { useState } from "react";
import { CalendarDays, LayoutDashboard, UserRound } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";

type ProTab = "panel" | "clases" | "perfil";

type ClassSession = {
  id: string;
  title: string;
  time: string;
  place: string;
  price: string;
};

const ITEMS = [
  { id: "panel" as const, label: "Mi Panel", icon: LayoutDashboard },
  { id: "clases" as const, label: "Mis Clases", icon: CalendarDays },
  { id: "perfil" as const, label: "Perfil", icon: UserRound },
];

export function ProApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<ProTab>("panel");
  const [choice, setChoice] = useState<"full" | "waitlist" | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    time: "",
    place: "",
    price: "",
  });
  const [classes, setClasses] = useState<ClassSession[]>([
    {
      id: "movilidad",
      title: "Movilidad y core",
      time: "Sáb 10:00",
      place: "María Luisa",
      price: "12 Cr",
    },
  ]);

  function publish() {
    if (!draft.title.trim()) return;
    setClasses((current) => [
      {
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        time: draft.time.trim() || "Por confirmar",
        place: draft.place.trim() || "Por confirmar",
        price: draft.price.trim() ? `${draft.price.trim()} Cr` : "—",
      },
      ...current,
    ]);
    setDraft({ title: "", time: "", place: "", price: "" });
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={onExit} aria-label="Volver al inicio">
            <Logo />
          </button>
          <p className="text-sm text-zinc-400">Carlos Ruiz</p>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-5">
        {tab === "panel" && (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6">
              <p className="text-sm text-zinc-500">Cobros</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-[#A3E635]">
                1.250 €
              </p>
              <p className="mt-3 text-sm text-zinc-400">★ 4.9</p>
            </div>

            <div className="rounded-[28px] border border-[#A3E635] bg-[#0A0A0A] p-5">
              <p className="text-lg font-semibold leading-snug text-white">
                Falta 1 plaza para tu clase. ¿Qué deseas hacer?
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setChoice("full")}
                  className="h-12 w-full rounded-2xl bg-[#A3E635] text-sm font-semibold text-black"
                >
                  Impartir cobrando el 100%
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("waitlist")}
                  className="h-12 w-full rounded-2xl border border-[#A3E635]/40 text-sm font-semibold text-[#A3E635]"
                >
                  Becar a lista de espera
                </button>
              </div>
              {choice && (
                <p className="mt-3 text-sm text-[#A3E635]">Clase confirmada.</p>
              )}
            </div>
          </div>
        )}

        {tab === "clases" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCreating((open) => !open)}
              className="h-16 w-full rounded-[28px] bg-[#A3E635] text-base font-semibold text-black"
            >
              Crear Nueva Sesión
            </button>

            {creating && (
              <form
                className="space-y-3 rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  publish();
                }}
              >
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  placeholder="Nombre"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none"
                />
                <input
                  value={draft.time}
                  onChange={(event) =>
                    setDraft({ ...draft, time: event.target.value })
                  }
                  placeholder="Hora"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none"
                />
                <input
                  value={draft.place}
                  onChange={(event) =>
                    setDraft({ ...draft, place: event.target.value })
                  }
                  placeholder="Lugar"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none"
                />
                <input
                  value={draft.price}
                  onChange={(event) =>
                    setDraft({ ...draft, price: event.target.value })
                  }
                  placeholder="Precio en créditos"
                  inputMode="numeric"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-white text-sm font-semibold text-black"
                >
                  Publicar
                </button>
              </form>
            )}

            {classes.length === 0 ? (
              <p className="px-2 pt-6 text-center text-sm text-zinc-500">
                Aquí aparecerán tus sesiones.
              </p>
            ) : (
              classes.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-xl font-semibold text-[#A3E635]">
                      {item.price}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
                    <span>{item.time}</span>
                    <span>{item.place}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "perfil" && (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A3E635] text-2xl font-semibold text-black">
                C
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Carlos Ruiz</h2>
              <p className="mt-1 text-sm text-[#A3E635]">Verificado</p>
              <p className="mt-4 text-sm text-zinc-400">★ 4.9 · Sevilla</p>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="h-12 w-full rounded-2xl border border-white/10 text-sm text-zinc-300"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </main>

      <BottomNav items={ITEMS} active={tab} onChange={setTab} />
    </div>
  );
}
