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

function formatSupply(amount: string | null, decimals: number): string {
  if (!amount) return "—";
  const num = Number(amount) / Math.pow(10, decimals);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString();
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value < 40 ? "bg-danger" : value < 70 ? "bg-warning" : "bg-success";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function IntelOverview({ data, pending }: { data: IntelData; pending: Set<string> }) {
  const { scan, accumulation } = data;
  const scanLoading = pending.has("scan");
  const accLoading = pending.has("accumulation");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Token Info */}
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Token Info
          </div>
          {scanLoading ? (
            <div className="flex items-center gap-2 py-8 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin" /> Loading token data...
            </div>
          ) : scan ? (
            <div className="space-y-3">
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {scan.metadata?.name ?? "Unknown Token"}
                </div>
                <div className="text-sm text-text-secondary">
                  {scan.metadata?.symbol ? `$${scan.metadata.symbol}` : "—"}
                </div>
              </div>

              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Price</dt>
                  <dd className="font-mono text-text-primary">{formatUsd(scan.price_usdc)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Supply</dt>
                  <dd className="font-mono text-text-primary">
                    {scan.supply ? formatSupply(scan.supply.amount, scan.supply.decimals) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Holders</dt>
                  <dd className="font-mono text-text-primary">
                    {scan.holders?.total_holders?.toLocaleString() ?? "—"}
                  </dd>
                </div>
                {scan.metadata?.uri && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Metadata</dt>
                    <dd>
                      <a
                        href={scan.metadata.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-accent hover:underline"
                      >
                        URI ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {scan.risk.warnings.length > 0 && (
                <div className="space-y-1 border-t border-dashed border-border pt-3">
                  <div className="text-[11px] text-text-muted">Risk Warnings</div>
                  <div className="flex flex-wrap gap-1.5">
                    {scan.risk.warnings.map((w, i) => (
                      <Badge key={i} className="border-danger/30 text-danger">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">Token data unavailable</p>
          )}
        </div>

        {/* Right: Accumulation */}
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Accumulation Score
          </div>
          {accLoading ? (
            <div className="flex items-center gap-2 py-8 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin" /> Loading accumulation data...
            </div>
          ) : accumulation ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ScoreGauge value={accumulation.score} />
                <div className="space-y-1">
                  <Badge
                    className={cn(
                      accumulation.label === "strong"
                        ? "border-success/30 text-success"
                        : accumulation.label === "moderate"
                          ? "border-warning/30 text-warning"
                          : "border-danger/30 text-danger",
                    )}
                  >
                    {accumulation.label}
                  </Badge>
                  <p className="text-xs text-text-muted">
                    {accumulation.metrics.watchlist_wallets} watchlist wallets
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <ScoreBar label="Distribution" value={accumulation.metrics.distribution_score} />
                <ScoreBar label="Inflow" value={accumulation.metrics.inflow_score} />
                <ScoreBar label="Activity" value={accumulation.metrics.activity_score} />
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">Accumulation data unavailable</p>
          )}
        </div>
      </div>

      {/* Bottom: Liquidity */}
      {scan && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Liquidity" value={formatUsd(scan.liquidity.estimated_usdc)} />
          <MetricCard label="Pools" value={scan.liquidity.pool_count} />
          <MetricCard
            label="Top 10 Share"
            value={scan.holders?.top10_share != null ? `${(scan.holders.top10_share * 100).toFixed(1)}%` : "—"}
          />
        </div>
      )}
    </div>
  );
}
