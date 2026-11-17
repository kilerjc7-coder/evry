import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "elevated" | "interactive";
export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: ReactNode;
  /**
   * Extra classes for layout extensions (e.g. `col-span-2`).
   * `cn` only concatenates — it does not resolve conflicting Tailwind
   * utilities (e.g. `p-0` will not reliably override `padding="md"`).
   */
  className?: string;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-border bg-surface",
  elevated: "border-border-brand bg-surface-raised shadow-card",
  /**
   * Visual hover affordance only. Does not make the card a control.
   * Prefer a real <button> / <a> (or interactive children) when the
   * whole surface must be activatable — do not put onClick on a
   * non-focusable div.
   */
  interactive:
    "border-border bg-surface transition duration-fast ease-out hover:border-border-brand",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * Structural surface primitive. No domain logic (sessions, prices, users).
 *
 * `variant="interactive"` only adjusts hover styles. It does **not** add
 * `role="button"`, keyboard handling, or focus behavior. When the entire
 * card should be clickable, wrap content in a real `<button>` or `<a>`,
 * or place those controls inside the card — avoid `onClick` on this div.
 */
export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-2xl border",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div {...props} className={cn("flex flex-col gap-1", className)}>
      {children}
    </div>
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div {...props} className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      {...props}
      className={cn("mt-4 flex items-center gap-2", className)}
    >
      {children}
    </div>
  );
}

export type CardMediaProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/**
 * Media slot for images/video via `children`.
 * No default radius — `Card` already clips with `overflow-hidden` +
 * `rounded-2xl`, which avoids double radii when the card has padding.
 * For edge-to-edge media, use `Card` with `padding="none"`.
 */
export function CardMedia({ className, children, ...props }: CardMediaProps) {
  return (
    <div {...props} className={cn("relative overflow-hidden", className)}>
      {children}
    </div>
  );
}
