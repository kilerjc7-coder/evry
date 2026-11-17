import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "aria-busy"
>;

type ButtonSharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  /**
   * Extra classes for layout extensions (e.g. `mt-4`, `w-auto`).
   * `cn` only concatenates — it does not resolve conflicting Tailwind
   * utilities. Prefer extending; do not rely on overriding `p-*`, `h-*`,
   * `rounded-*`, or `bg-*` from the variant/size styles.
   */
  className?: string;
} & NativeButtonProps;

type ButtonIconOnlyProps = ButtonSharedProps & {
  iconOnly: true;
  /**
   * Accessible name for icon-only buttons. Required.
   * Must be a meaningful, non-empty string (not `""` or whitespace-only).
   */
  "aria-label": string;
  /** Icon content when `leftIcon` is not set. */
  children?: ReactNode;
  leftIcon?: ReactNode;
  /** Not supported on icon-only buttons. */
  rightIcon?: never;
};

type ButtonWithLabelProps = ButtonSharedProps & {
  iconOnly?: false;
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type ButtonProps = ButtonIconOnlyProps | ButtonWithLabelProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed",
  secondary:
    "border border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
  outline:
    "border border-border-brand bg-transparent text-brand hover:bg-brand-subtle active:bg-brand-muted",
  ghost:
    "bg-transparent text-fg-muted hover:bg-surface-overlay hover:text-fg",
  danger:
    "border border-danger-muted bg-transparent text-danger hover:border-danger hover:bg-danger-muted/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-2xl px-3 text-sm",
  md: "h-12 gap-2 rounded-2xl px-4 text-sm",
  lg: "h-14 gap-2 rounded-2xl px-5 text-sm",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 w-9 rounded-2xl p-0",
  md: "h-12 w-12 rounded-2xl p-0",
  lg: "h-14 w-14 rounded-2xl p-0",
};

const contentGapClasses: Record<ButtonSize, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  fullWidth = false,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      className={cn(
        "relative inline-flex items-center justify-center font-semibold transition duration-fast ease-out",
        "focus-visible:outline-none focus-visible:shadow-[var(--evry-ring-focus)]",
        "disabled:pointer-events-none disabled:opacity-[var(--evry-opacity-disabled)]",
        !isDisabled && "active:scale-[var(--evry-scale-press)]",
        variantClasses[variant],
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center",
          !iconOnly && contentGapClasses[size],
          loading && "opacity-0"
        )}
      >
        {iconOnly ? (
          (leftIcon ?? children)
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </span>

      {loading ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <Loader2
            className={cn(iconSizeClasses[size], "animate-spin")}
            aria-hidden
          />
        </span>
      ) : null}
    </button>
  );
}
