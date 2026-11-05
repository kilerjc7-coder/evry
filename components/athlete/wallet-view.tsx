const PACKS = [
  { id: "inicio", name: "Inicio", credits: 20, price: "20 €", highlight: false },
  { id: "progreso", name: "Progreso", credits: 55, price: "50 €", highlight: true },
  { id: "constancia", name: "Constancia", credits: 115, price: "100 €", highlight: false },
];

export function WalletView({
  credits,
  onBuy,
}: {
  credits: number;
  onBuy: (amount: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#A3E635]/40 bg-[#0A0A0A] px-6 py-8 text-center">
        <p className="text-sm text-zinc-500">Saldo</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-[#A3E635]">
          {credits}
        </p>
        <p className="mt-2 text-sm text-zinc-400">1 crédito = 1 €</p>
      </div>

      <div className="space-y-3">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`flex items-center justify-between rounded-[28px] bg-[#0A0A0A] p-5 ${
              pack.highlight
                ? "border-2 border-[#A3E635]"
                : "border border-white/10"
            }`}
          >
            <div>
              <p className="text-lg font-semibold text-white">{pack.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{pack.credits} créditos</p>
            </div>
            <button
              type="button"
              onClick={() => onBuy(pack.credits)}
              className={`h-11 rounded-2xl px-4 text-sm font-semibold ${
                pack.highlight
                  ? "bg-[#A3E635] text-black"
                  : "bg-zinc-900 text-white"
              }`}
            >
              {pack.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
