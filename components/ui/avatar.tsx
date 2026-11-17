"use client";

import { useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  /** Visible initials/text when there is no image or loading fails. */
  fallback: string;
  /**
   * Extra classes for layout extensions.
   * `cn` only concatenates — it does not resolve conflicting Tailwind utilities.
   */
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">;

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-2xl",
};

/**
 * Circular user/entity mark. Image when `src` works; otherwise `fallback`.
 * No domain logic (roles, verification, credits).
 */
export function Avatar({
  size = "md",
  src,
  alt,
  fallback,
  className,
  ...props
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const showImage = Boolean(src) && src !== failedSrc;
  const label = alt?.trim() || fallback.trim() || "Avatar";
  const initials = fallback.trim().slice(0, 2);

  return (
    <span
      {...props}
      role="img"
      aria-label={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised font-semibold text-brand",
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden className="select-none leading-none tracking-tight">
          {initials}
        </span>
      )}
    </span>
  );
}
