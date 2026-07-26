"use client";

import { useGetNetworkStatsQuery } from "@/lib/store/api/stakingApi";
import type { StatCardData } from "@/lib/constants/stats";
import { StatCard } from "./StatCard";
import { formatNumber } from "@/lib/utils/format";

interface EconomyCardsProps {
  mockStats: StatCardData[];
}

function formatUsd(value: number): string {
  return `$${formatNumber(Math.round(value))}`;
}

function formatOrvxCompact(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return formatNumber(num);
}

export function EconomyCards({ mockStats }: EconomyCardsProps) {
  const { data } = useGetNetworkStatsQuery();

  const stats = mockStats.map((stat) => {
    if (!data) return stat;

    if (stat.label === "ORVX BUYBACKS") {
      const usdc = parseFloat(data.buyback_budget_usdc);
      return {
        ...stat,
        value: Number.isNaN(usdc) ? stat.value : formatUsd(usdc),
      };
    }

    if (stat.label === "ORVX BURNED") {
      return {
        ...stat,
        value: `${formatOrvxCompact(data.total_orvx_burned)}`,
      };
    }

    return stat;
  });

  return (
    <section className="px-[4%] py-4">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-dm-mono text-[13px] font-medium uppercase tracking-[0.15em] text-[#2DAEFF]">
          ECONOMY
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
