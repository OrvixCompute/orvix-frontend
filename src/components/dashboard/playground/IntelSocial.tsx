"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { ScoreGauge, MetricCard } from "@/components/dashboard/playground/intel-shared";
import type { IntelData } from "@/components/dashboard/playground/TokenIntel";

function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

const SENTIMENT_STYLES = {
  positive: "border-success/30 text-success",
  neutral: "border-warning/30 text-warning",
  negative: "border-danger/30 text-danger",
} as const;

export function IntelSocial({ data, pending }: { data: IntelData; pending: Set<string> }) {
  const { social } = data;
  const socialLoading = pending.has("social");

  if (socialLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary py-16 text-xs text-text-muted">
        <Loader2 size={14} className="animate-spin" /> Loading social data...
      </div>
    );
  }

  if (!social) {
    return (
      <div className="rounded-lg border border-border bg-bg-secondary p-8 text-center">
        <p className="text-sm text-text-tertiary">Social data unavailable</p>
      </div>
    );
  }

  const priceChange = social.metrics.dex_price_change_24h;

  return (
    <div className="space-y-4">
      {/* Score + Sentiment */}
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-bg-secondary p-6 sm:flex-row">
        <ScoreGauge value={social.social_score} label="Social Score" />
        <div className="space-y-2 text-center sm:text-left">
          <div className="text-lg font-semibold text-text-primary">Social Analysis</div>
          {social.metrics.social_sentiment && (
            <Badge className={SENTIMENT_STYLES[social.metrics.social_sentiment]}>
              {social.metrics.social_sentiment}
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="DexScreener"
          value={
            social.metrics.dex_trending ? (
              <Badge className="border-success/30 text-success">Trending</Badge>
            ) : (
              <Badge className="border-border-strong text-text-secondary">Not Trending</Badge>
            )
          }
        />
        <MetricCard label="24h Volume" value={formatUsd(social.metrics.dex_volume_24h)} />
        <MetricCard
          label="24h Change"
          value={
            priceChange != null ? (
              <span className={cn(priceChange >= 0 ? "text-success" : "text-danger")}>
                {priceChange >= 0 ? "↑" : "↓"} {Math.abs(priceChange).toFixed(2)}%
              </span>
            ) : (
              "—"
            )
          }
        />
        <MetricCard label="Twitter Followers" value={formatNumber(social.metrics.twitter_followers)} />
      </div>

      {/* Twitter Activity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Twitter Activity (7d)
          </div>
          <div className="text-2xl font-semibold text-text-primary">
            {formatNumber(social.metrics.twitter_statuses_7d)}
          </div>
          <p className="text-xs text-text-muted">statuses posted</p>
        </div>

        {/* Social Links */}
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Social Links
          </div>
          <div className="flex flex-wrap gap-2">
            {social.social_links.twitter && (
              <a
                href={social.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-bg-tertiary px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Twitter ↗
              </a>
            )}
            {social.social_links.website && (
              <a
                href={social.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-bg-tertiary px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Website ↗
              </a>
            )}
            {social.social_links.telegram && (
              <a
                href={social.social_links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-bg-tertiary px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Telegram ↗
              </a>
            )}
            {social.social_links.discord && (
              <a
                href={social.social_links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-bg-tertiary px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Discord ↗
              </a>
            )}
            {!social.social_links.twitter &&
              !social.social_links.website &&
              !social.social_links.telegram &&
              !social.social_links.discord && (
                <p className="text-xs text-text-tertiary">No social links found</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
