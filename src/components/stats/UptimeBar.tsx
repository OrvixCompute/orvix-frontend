"use client";

import { ShieldCheck, Clock } from "lucide-react";

interface UptimeBarProps {
  uptime: string;
  lastUpdated: string;
}

export function UptimeBar({ uptime, lastUpdated }: UptimeBarProps) {
  return (
    <section className="px-[4%] py-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[#2DAEFF]" />
              <div className="flex flex-col">
                <span className="font-dm-mono text-[11px] uppercase tracking-[0.12em] text-[#7D7D7D]">
                  NETWORK UPTIME
                </span>
                <span className="font-plus text-[18px] font-semibold text-white">
                  {uptime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#7D7D7D]" />
              <div className="flex flex-col">
                <span className="font-dm-mono text-[11px] uppercase tracking-[0.12em] text-[#7D7D7D]">
                  LAST UPDATED
                </span>
                <span className="font-dm-mono text-[13px] text-white">
                  {lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
