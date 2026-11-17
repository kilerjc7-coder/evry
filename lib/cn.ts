type ClassPrimitive = string | number | null | undefined | false | 0 | 0n;
type ClassValue = ClassPrimitive | ClassValue[];

/**
 * Concatenates truthy class names.
 * Does not resolve conflicting Tailwind utilities (no merge).
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    }
  }

  return out.join(" ");
}
