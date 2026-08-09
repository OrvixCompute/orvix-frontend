import { parseNumeric } from "./format";
import type { EarningsDay } from "@/lib/types/provider";

export interface DailyPoint {
  /** YYYY-MM-DD, UTC. */
  date: string;
  amount: number;
  jobs: number;
}

/** YYYY-MM-DD for a UTC day offset from `end`. Days are UTC because the API's are. */
function utcDayKey(end: Date, daysBack: number): string {
  const d = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - daysBack),
  );
  return d.toISOString().slice(0, 10);
}

/**
 * Expand the API's sparse day series into `days` consecutive days ending today.
 *
 * `earnings_by_day` only contains days that had jobs. Charting it as-is spaces
 * the points evenly, so a gap of three idle weeks renders the same width as a
 * gap of one day and the x-axis lies about when the work happened. Missing days
 * are real zeros, and this fills them in.
 *
 * Days outside the window are dropped; duplicates for one date are summed.
 */
export function fillDailySeries(
  points: EarningsDay[] | null | undefined,
  days = 30,
  end: Date = new Date(),
): DailyPoint[] {
  const byDate = new Map<string, { amount: number; jobs: number }>();
  for (const point of points ?? []) {
    if (!point?.date) continue;
    const existing = byDate.get(point.date) ?? { amount: 0, jobs: 0 };
    byDate.set(point.date, {
      amount: existing.amount + (parseNumeric(point.amount) ?? 0),
      jobs: existing.jobs + (point.jobs_count ?? 0),
    });
  }

  const series: DailyPoint[] = [];
  for (let back = days - 1; back >= 0; back -= 1) {
    const date = utcDayKey(end, back);
    const hit = byDate.get(date);
    series.push({ date, amount: hit?.amount ?? 0, jobs: hit?.jobs ?? 0 });
  }
  return series;
}

/** Total of a filled series — the window's earnings, as opposed to lifetime. */
export function sumDaily(series: DailyPoint[]): number {
  return series.reduce((total, point) => total + point.amount, 0);
}
