"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { TruncatedAddress } from "@/components/dashboard/playground/intel-shared";
import type { IntelData } from "@/components/dashboard/playground/TokenIntel";

const CHART_COLORS = ["#9945ff", "#a855f7", "#c084fc", "#e9d5ff", "#6b7280"];

const SIGNAL_STYLES: Record<string, string> = {
  shared_funding: "border-blue-500/30 text-blue-400",
  coordinated_timing: "border-yellow-500/30 text-yellow-400",
  overlapping_holdings: "border-purple-500/30 text-purple-400",
};

function confidenceColor(c: number): string {
  if (c <= 0.33) return "bg-success";
  if (c <= 0.67) return "bg-warning";
  return "bg-danger";
}

export function IntelHolders({ data }: { data: IntelData }) {
  const { holders, clusters } = data;

  const top10Pct = holders?.top10_share != null ? holders.top10_share * 100 : null;
  const chartData =
    top10Pct != null
      ? [
          { name: "Top 10", value: top10Pct },
          { name: "Others", value: 100 - top10Pct },
        ]
      : null;

  return (
    <div className="space-y-6">
      {/* Holders Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        {/* Donut Chart */}
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Top 10 Share
          </div>
          {chartData ? (
            <div className="flex flex-col items-center">
              <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        border: "1px solid #1f1f1f",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <div className="text-lg font-semibold text-text-primary">{top10Pct?.toFixed(1)}%</div>
                <div className="text-xs text-text-muted">held by top 10</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">No holder data</p>
          )}
        </div>

        {/* Holders Table */}
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Top Holders
          </div>
          {holders && holders.top_holders.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="pb-2 pr-3">#</th>
                      <th className="pb-2 pr-3">Wallet</th>
                      <th className="pb-2 pr-3 text-right">Balance</th>
                      <th className="pb-2 text-right">% Supply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders.top_holders.slice(0, 10).map((h, i) => {
                      const totalSupply = holders.top_holders.reduce((s, x) => s + x.balance, 0);
                      const pct = totalSupply > 0 ? (h.balance / totalSupply) * 100 : 0;
                      return (
                        <tr key={h.wallet} className="border-b border-border/50">
                          <td className="py-2 pr-3 text-text-muted">{i + 1}</td>
                          <td className="py-2 pr-3">
                            <TruncatedAddress address={h.wallet} />
                          </td>
                          <td className="py-2 pr-3 text-right font-mono text-text-primary">
                            {h.balance.toLocaleString()}
                          </td>
                          <td className="py-2 text-right font-mono text-text-secondary">
                            {pct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="space-y-2 sm:hidden">
                {holders.top_holders.slice(0, 10).map((h, i) => {
                  const totalSupply = holders.top_holders.reduce((s, x) => s + x.balance, 0);
                  const pct = totalSupply > 0 ? (h.balance / totalSupply) * 100 : 0;
                  return (
                    <div key={h.wallet} className="rounded border border-border bg-bg-tertiary p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">#{i + 1}</span>
                        <TruncatedAddress address={h.wallet} />
                      </div>
                      <div className="mt-1 flex justify-between text-xs">
                        <span className="font-mono text-text-primary">{h.balance.toLocaleString()}</span>
                        <span className="font-mono text-text-secondary">{pct.toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-text-tertiary">No holder data available</p>
          )}
        </div>
      </div>

      {/* Clusters Section */}
      <div className="rounded-lg border border-border bg-bg-secondary p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Wallet Clusters
        </div>
        {clusters && clusters.clusters.length > 0 ? (
          <div className="space-y-3">
            {clusters.clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="rounded border border-border bg-bg-tertiary p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {cluster.signals.map((signal) => (
                    <Badge key={signal} className={SIGNAL_STYLES[signal] ?? ""}>
                      {signal.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {cluster.wallets.slice(0, 6).map((w) => (
                    <TruncatedAddress key={w} address={w} className="text-[11px]" />
                  ))}
                  {cluster.wallets.length > 6 && (
                    <span className="text-[11px] text-text-muted">
                      +{cluster.wallets.length - 6} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary">
                      <div
                        className={cn("h-full rounded-full", confidenceColor(cluster.confidence))}
                        style={{ width: `${cluster.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-text-secondary">
                    {(cluster.confidence * 100).toFixed(0)}%
                  </span>
                  {cluster.confidence > 0.6 && (
                    <span className="text-warning">⚠</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary">No coordinated clusters detected</p>
        )}
      </div>
    </div>
  );
}
