import type { NavItem } from "@/components/bottom-nav";
import { cn } from "@/lib/cn";

/**
 * Desktop side navigation for AthleteApp.
 * Presentational only — active tab state stays in the parent.
 */
export function SideNav<T extends string>({
  items,
  active,
  onChange,
  className,
}: {
  items: NavItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "flex w-[248px] shrink-0 flex-col border-r border-white/10 bg-[#050505]",
        "px-3 py-5",
        className
      )}
    >
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = item.id === active;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium tracking-tight transition duration-fast ease-out",
                  "focus-visible:outline-none focus-visible:shadow-[var(--evry-ring-focus)]",
                  selected
                    ? "bg-brand-muted text-brand"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                )}
              >
                {selected ? (
                  <span
                    className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={selected ? 2.4 : 1.8}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
