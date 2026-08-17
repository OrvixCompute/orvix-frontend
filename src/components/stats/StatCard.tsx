"use client";

import {
  ArrowUp,
  ArrowDown,
  Server,
  Cpu,
  MemoryStick,
  Users,
  Coins,
  RefreshCcw,
  Flame,
  MessageSquare,
  Image,
  Video,
  Clock,
  Bot,
  type LucideIcon,
} from "lucide-react";
import type { StatCardData, IconName } from "@/lib/types/stats";

const ICONS: Record<IconName, LucideIcon> = {
  Server,
  Cpu,
  MemoryStick,
  Users,
  Coins,
  RefreshCcw,
  Flame,
  MessageSquare,
  Image,
  Video,
  Clock,
  Bot,
};

interface StatCardProps {
  stat: StatCardData;
  loading?: boolean;
}

export function StatCard({ stat, loading = false }: StatCardProps) {
  const Icon = ICONS[stat.icon];

  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 transition-colors hover:border-[#2A2A2A]">
      <div className="flex items-center gap-2 text-[#7D7D7D]">
        <Icon size={16} className="text-[#2DAEFF]" />
        <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.12em]">
          {stat.label}
        </span>
      </div>

      {loading ? (
        <>
          <div className="mt-4 h-[32px] w-24 animate-pulse rounded bg-[#161616]" />
          <div className="mt-4 h-[12px] w-32 animate-pulse rounded bg-[#141414]" />
        </>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-plus text-[28px] font-semibold text-white md:text-[32px]">
              {stat.value}
            </span>
            {stat.unit && (
              <span className="font-plus text-[16px] font-medium text-[#7D7D7D]">
                {stat.unit}
              </span>
            )}
          </div>

          <div className="mt-3 flex min-h-[18px] items-center gap-2">
            {stat.trend && (
              <span className="inline-flex items-center gap-1 font-dm-mono text-[12px] font-medium text-[#26CC6B]">
                {stat.trend.direction === "up" ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                {stat.trend.value}
              </span>
            )}
            {stat.trend?.label && (
              <span className="font-dm-mono text-[12px] text-[#5A5A5A]">
                {stat.trend.label}
              </span>
            )}
            {stat.sub && !stat.trend && (
              <span className="font-dm-mono truncate text-[12px] text-[#5A5A5A]">
                {stat.sub}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
