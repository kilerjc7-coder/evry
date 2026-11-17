import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "brand";

export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: ReactNode;
  /**
   * Extra classes for layout extensions.
   * `cn` only concatenates — it does not resolve conflicting Tailwind utilities.
   */
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className">;

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-overlay text-fg-muted",
  success: "border-transparent bg-brand-muted text-brand",
  warning: "border-border-strong bg-surface-raised text-fg",
  danger: "border-transparent bg-danger-muted text-danger",
  brand: "border-transparent bg-brand text-on-brand",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-2xs font-semibold",
  md: "px-2.5 py-1 text-xs font-semibold",
};

/**
 * Compact status/label chip. Semantically neutral (`<span>`);
 * no domain meaning (credits, sessions, tiers).
 *
 * Color mapping uses existing EVRY tokens only:
 * - `success` → brand (lime accent; no separate success token)
 * - `warning` → elevated surface + strong border (no amber token)
 */
export function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-full border tracking-wide",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
