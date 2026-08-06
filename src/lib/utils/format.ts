/** Format an integer-ish number with thousand separators (for mono display). */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/** Format a USDC amount with a fixed number of decimals. */
export function formatUsdc(value: number | null | undefined, decimals = 6): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(decimals);
}

/** Format an ISO timestamp as a short, locale date-time (e.g. "Jun 27, 09:42"). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Parse a numeric that the API sends as a string (Postgres numeric). */
export function parseNumeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

/** Split a number into a compact mantissa and its magnitude suffix (1_770 -> "1.8" + "k"). */
export function splitCompact(value: number | null | undefined): { value: string; unit: string } {
  if (value === null || value === undefined || Number.isNaN(value)) return { value: "—", unit: "" };
  const magnitudes: Array<[number, string]> = [
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "k"],
  ];
  for (const [threshold, unit] of magnitudes) {
    if (Math.abs(value) >= threshold) {
      return { value: (value / threshold).toFixed(1).replace(/\.0$/, ""), unit };
    }
  }
  return { value: formatNumber(value), unit: "" };
}

/** Compact large numbers (1_200 -> 1.2k). */
export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}
