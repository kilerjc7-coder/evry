export type Role = "athlete" | "pro";

export function Landing({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#A3E635] text-5xl font-black text-black shadow-[0_0_48px_rgba(163,230,53,0.35)]">
          E
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
          EVRY
        </h1>

        <div className="mt-14 flex w-full flex-col gap-4">
          <button
            type="button"
            onClick={() => onSelect("athlete")}
            className="h-24 rounded-[28px] bg-[#A3E635] text-xl font-semibold text-black transition active:scale-[0.98]"
          >
            Entrar como Deportista
          </button>
          <button
            type="button"
            onClick={() => onSelect("pro")}
            className="h-24 rounded-[28px] border border-[#A3E635]/50 bg-[#0A0A0A] text-xl font-semibold text-white transition active:scale-[0.98]"
          >
            Entrar como Profesional
          </button>
        </div>
      </div>
    </div>
  );
}
