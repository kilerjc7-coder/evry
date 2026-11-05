import type { LucideIcon } from "lucide-react";

export type NavItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

export function BottomNav<T extends string>({
  items,
  active,
  onChange,
}: {
  items: NavItem<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050505]/95 backdrop-blur-md">
      <div
        className="mx-auto grid max-w-md px-1 pt-2"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))",
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition ${
                selected ? "text-[#A3E635]" : "text-zinc-500"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={selected ? 2.4 : 1.8} />
              <span className="truncate px-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
