"use client";

import { useGetNetworkStatsQuery } from "@/lib/store/api/stakingApi";
import { formatNumber } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { NetworkStats as NetworkStatsType } from "@/lib/types/orvix";

interface StatDef {
  label: string;
  unit: string;
  /** Pull a display number out of the raw API response (strings -> numbers). */
  select: (s: NetworkStatsType) => number;
}

const STATS: StatDef[] = [
  { label: "staked", unit: "ORVX", select: (s) => parseFloat(s.total_staked) },
  { label: "providers", unit: "active", select: (s) => s.total_providers },
  { label: "burned", unit: "ORVX", select: (s) => parseFloat(s.total_orvx_burned) },
  { label: "bought back", unit: "ORVX", select: (s) => parseFloat(s.total_orvx_bought) },
];

export function NetworkStats() {
  const { data, isLoading, isError } = useGetNetworkStatsQuery();

  return (
    <section className="grid grid-cols-2 gap-8 md:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="space-y-1.5 text-left">
          <div className="text-xs text-text-muted">{stat.label}</div>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <div className="font-mono text-lg text-text-primary md:text-xl">
              {/* "0" is honest — show it without celebration; "—" on error. */}
              {isError || !data ? "—" : formatNumber(stat.select(data))}
            </div>
          )}
          <div className="text-[11px] text-text-muted">{stat.unit}</div>
        </div>
      ))}
    </section>
  );
}
