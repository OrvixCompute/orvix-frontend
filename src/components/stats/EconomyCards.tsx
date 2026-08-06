"use client";

import type { NetworkStats } from "@/lib/types/orvix";
import type { StatCardData } from "@/lib/types/stats";
import { StatSection } from "./StatSection";
import { formatCompact, formatDateTime, formatNumber, parseNumeric } from "@/lib/utils/format";

interface EconomyCardsProps {
  data?: NetworkStats;
  loading?: boolean;
}

/** ORVX amounts arrive as numeric strings — parse, then compact. */
function orvx(value: string | null | undefined): string {
  return formatCompact(parseNumeric(value));
}

function usd(value: string | null | undefined): string {
  const num = parseNumeric(value);
  if (num === null) return "—";
  if (num > 0 && num < 0.01) return "<$0.01";
  if (num < 1000) return `$${num.toFixed(2)}`;
  return `$${formatNumber(Math.round(num))}`;
}

const PLACEHOLDERS: StatCardData[] = [
  { label: "ORVX STAKED", value: "—", icon: "Coins" },
  { label: "ORVX BOUGHT BACK", value: "—", icon: "RefreshCcw" },
  { label: "ORVX BURNED", value: "—", icon: "Flame" },
  { label: "BUYBACK BUDGET", value: "—", icon: "Coins" },
];

function cards(data: NetworkStats): StatCardData[] {
  return [
    {
      label: "ORVX STAKED",
      value: orvx(data.total_staked),
      unit: " ORVX",
      icon: "Coins",
      sub: `${formatNumber(data.total_providers)} providers`,
    },
    {
      label: "ORVX BOUGHT BACK",
      value: orvx(data.total_orvx_bought),
      unit: " ORVX",
      icon: "RefreshCcw",
      sub: data.last_buyback_at
        ? `Last buyback ${formatDateTime(data.last_buyback_at)}`
        : "No buybacks yet",
    },
    {
      label: "ORVX BURNED",
      value: orvx(data.total_orvx_burned),
      unit: " ORVX",
      icon: "Flame",
      sub: data.last_burn_at
        ? `Last burn ${formatDateTime(data.last_burn_at)}`
        : "No burns yet",
    },
    {
      label: "BUYBACK BUDGET",
      value: usd(data.buyback_budget_usdc),
      icon: "Coins",
      sub: `${orvx(data.orvx_held_for_burn)} ORVX held for burn`,
    },
  ];
}

export function EconomyCards({ data, loading = false }: EconomyCardsProps) {
  return (
    <StatSection
      title="ECONOMY"
      stats={data ? cards(data) : PLACEHOLDERS}
      columns={4}
      loading={loading}
    />
  );
}
