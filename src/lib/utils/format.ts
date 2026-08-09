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

/**
 * Format a USDC amount that may sit far below cent scale.
 *
 * Provider earnings are currently in the millionths ("0.000206"), so the usual
 * two-decimal money format renders real income as 0.00. This keeps up to six
 * decimals, trims the trailing zeros they leave behind, and never shows a
 * non-zero amount as zero.
 */
export function formatUsdcAmount(value: string | number | null | undefined): string {
  const num = parseNumeric(value);
  if (num === null) return "—";
  if (num === 0) return "0.00";
  const fixed = num.toFixed(6);
  // USDC columns are numeric(20,6), so this should not arise — but if a smaller
  // amount ever reaches us, rounding it to 0.00 would make a non-zero balance
  // indistinguishable from an empty one.
  if (Number(fixed) === 0) return num > 0 ? "<0.000001" : ">-0.000001";
  // Trim trailing zeros but keep cents, so 5 reads as "5.00" not "5.".
  return fixed.replace(/(\.\d{2}\d*?)0+$/, "$1");
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
