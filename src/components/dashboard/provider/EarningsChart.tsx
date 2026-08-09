"use client";

import { useId, useState } from "react";
import { fillDailySeries, sumDaily, type DailyPoint } from "@/lib/utils/earnings";
import { formatUsdcAmount } from "@/lib/utils/format";
import type { EarningsDay } from "@/lib/types/provider";

const DAYS = 30;
const BAR_GAP = 2; // surface gap between adjacent bars
const PLOT_HEIGHT = 72;

/** "2026-08-09" → "Aug 9". Parsed as UTC to match the API's day boundaries. */
function shortDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

/**
 * Daily provider earnings over the last 30 days.
 *
 * One series, so no legend — the heading names it. Bars rather than a line
 * because each day is a discrete amount and most of them are zero; a line would
 * imply a continuous quantity moving between them.
 *
 * The series is expanded to one bar per calendar day before rendering. The API
 * only returns days that had jobs, and plotting those directly spaces a
 * three-week gap identically to a one-day gap.
 */
export function EarningsChart({ points }: { points: EarningsDay[] | null | undefined }) {
  const series = fillDailySeries(points, DAYS);
  const total = sumDaily(series);
  const [hover, setHover] = useState<DailyPoint | null>(null);
  const clipId = useId();

  // Nothing earned in the window: 30 empty slots would read as a broken chart
  // rather than an honest zero, so say it in words instead.
  if (total === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm text-text-secondary">No earnings in the last {DAYS} days</p>
        <p className="mt-1 text-xs text-text-tertiary">
          Jobs your nodes complete show up here the same day.
        </p>
      </div>
    );
  }

  const max = Math.max(...series.map((point) => point.amount));
  const barWidth = 100 / series.length;
  const active = hover ?? null;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs text-text-muted">Daily earnings · last {DAYS} days</span>
        <span className="font-mono text-xs text-text-secondary">
          {active ? `${shortDay(active.date)} · ` : ""}
          <span className="text-text-primary">
            {formatUsdcAmount(active ? active.amount : total)}
          </span>{" "}
          USDC
          {active ? ` · ${active.jobs} ${active.jobs === 1 ? "job" : "jobs"}` : " total"}
        </span>
      </div>

      <div className="relative" style={{ height: PLOT_HEIGHT }} onMouseLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 100 ${PLOT_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Daily earnings for the last ${DAYS} days, ${formatUsdcAmount(total)} USDC total`}
        >
          {/* Baseline — recessive, just enough to anchor the bars. */}
          <line
            x1="0"
            y1={PLOT_HEIGHT}
            x2="100"
            y2={PLOT_HEIGHT}
            stroke="#1f1f1f"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <clipPath id={clipId}>
            <rect x="0" y="0" width="100" height={PLOT_HEIGHT} />
          </clipPath>

          <g clipPath={`url(#${clipId})`}>
            {series.map((point, i) => {
              // A day with earnings always gets a visible bar: scaled to the
              // window's max it can round to sub-pixel, and an invisible bar
              // reads as a zero day.
              const scaled = max > 0 ? (point.amount / max) * (PLOT_HEIGHT - 4) : 0;
              const height = point.amount > 0 ? Math.max(scaled, 3) : 0;
              const x = i * barWidth;
              const isActive = active?.date === point.date;
              return (
                <g key={point.date}>
                  {height > 0 && (
                    <rect
                      x={x + BAR_GAP / 2}
                      y={PLOT_HEIGHT - height}
                      width={Math.max(barWidth - BAR_GAP, 0.5)}
                      height={height}
                      rx="1"
                      fill={isActive ? "#a855f7" : "#9945ff"}
                    />
                  )}
                  {/* Full-height hit target: the bars are far too thin to hover. */}
                  <rect
                    x={x}
                    y="0"
                    width={barWidth}
                    height={PLOT_HEIGHT}
                    fill="transparent"
                    onMouseEnter={() => setHover(point)}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex justify-between font-mono text-[10px] text-text-muted">
        <span>{shortDay(series[0].date)}</span>
        <span>{shortDay(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
}
