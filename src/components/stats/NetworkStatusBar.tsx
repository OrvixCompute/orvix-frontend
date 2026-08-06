"use client";

import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";

interface NetworkStatusBarProps {
  /** Live count from the websocket registry; undefined until stats load. */
  online?: number;
  windowHours?: number;
  generatedAt?: string;
  loading?: boolean;
}

export function NetworkStatusBar({
  online,
  windowHours,
  generatedAt,
  loading = false,
}: NetworkStatusBarProps) {
  const operational = online !== undefined && online > 0;
  const StatusIcon = operational ? ShieldCheck : ShieldAlert;

  const status =
    online === undefined
      ? "—"
      : operational
        ? `Operational — ${online} node${online === 1 ? "" : "s"} online`
        : "No nodes online";

  return (
    <section className="px-[4%] py-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <StatusIcon
                size={18}
                className={operational ? "text-[#26CC6B]" : "text-[#7D7D7D]"}
              />
              <div className="flex flex-col">
                <span className="font-dm-mono text-[11px] uppercase tracking-[0.12em] text-[#7D7D7D]">
                  NETWORK STATUS
                </span>
                {loading ? (
                  <div className="mt-1 h-[16px] w-40 animate-pulse rounded bg-[#161616]" />
                ) : (
                  <span className="font-plus text-[18px] font-semibold text-white">
                    {status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#7D7D7D]" />
              <div className="flex flex-col">
                <span className="font-dm-mono text-[11px] uppercase tracking-[0.12em] text-[#7D7D7D]">
                  LAST UPDATED
                </span>
                {loading ? (
                  <div className="mt-1 h-[14px] w-28 animate-pulse rounded bg-[#161616]" />
                ) : (
                  <span className="font-dm-mono text-[13px] text-white">
                    {generatedAt ? formatDateTime(generatedAt) : "—"}
                    {windowHours !== undefined && (
                      <span className="text-[#5A5A5A]">
                        {" · "}
                        {windowHours}h activity window
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
