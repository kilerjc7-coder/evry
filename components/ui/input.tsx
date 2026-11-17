"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: InputSize;
  /**
   * Extra classes on the native `<input>`.
   * `cn` only concatenates — it does not resolve conflicting Tailwind utilities.
   */
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size">;

const sizeClasses: Record<InputSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-4 text-sm",
  lg: "h-14 px-5 text-base",
};

const iconPadClasses: Record<
  InputSize,
  { left: string; right: string; icon: string }
> = {
  sm: { left: "pl-9", right: "pr-9", icon: "h-3.5 w-3.5" },
  md: { left: "pl-10", right: "pr-10", icon: "h-4 w-4" },
  lg: { left: "pl-11", right: "pr-11", icon: "h-4 w-4" },
};

function mergeAriaDescribedBy(
  ...values: Array<string | undefined>
): string | undefined {
  const ids = values
    .flatMap((value) => (value ? value.trim().split(/\s+/) : []))
    .filter(Boolean);
  const unique = [...new Set(ids)];
  return unique.length > 0 ? unique.join(" ") : undefined;
}

/**
 * Text field primitive with optional label, helper, error, and icons.
 * Native input props (`value`, `onChange`, `name`, `type`, etc.) pass through.
 */
export function Input({
  id: idProp,
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  size = "md",
  className,
  disabled,
  "aria-describedby": ariaDescribedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const hasError = error != null && error !== false && error !== "";
  const hasHelper =
    !hasError &&
    helperText != null &&
    helperText !== false &&
    helperText !== "";
  const internalDescribedBy = hasError
    ? errorId
    : hasHelper
      ? helperId
      : undefined;
  const describedBy = mergeAriaDescribedBy(
    ariaDescribedByProp,
    internalDescribedBy
  );
  const ariaInvalid = hasError ? true : ariaInvalidProp;
  const iconPads = iconPadClasses[size];

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label != null && label !== false && label !== "" ? (
        <label
          htmlFor={id}
          className="text-sm font-medium text-fg-muted"
        >
          {label}
        </label>
      ) : null}

      <div className="relative w-full">
        {leftIcon ? (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center justify-center text-fg-subtle",
              iconPads.icon,
              disabled && "opacity-[var(--evry-opacity-disabled)]"
            )}
            aria-hidden
          >
            {leftIcon}
          </span>
        ) : null}

        <input
          {...props}
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-2xl border bg-bg text-fg transition duration-fast ease-out",
            "placeholder:text-fg-faint",
            "outline-none focus-visible:shadow-[var(--evry-ring-focus)]",
            "disabled:cursor-not-allowed disabled:opacity-[var(--evry-opacity-disabled)]",
            hasError
              ? "border-danger focus-visible:border-danger"
              : "border-border focus-visible:border-border-brand",
            sizeClasses[size],
            leftIcon && iconPads.left,
            rightIcon && iconPads.right,
            className
          )}
        />

        {rightIcon ? (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center justify-center text-fg-subtle",
              iconPads.icon,
              disabled && "opacity-[var(--evry-opacity-disabled)]"
            )}
            aria-hidden
          >
            {rightIcon}
          </span>
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hasHelper ? (
        <p id={helperId} className="text-xs text-fg-subtle">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
