"use client";

import { TriangleAlert, RotateCw } from "lucide-react";

interface StatsErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function StatsErrorNotice({ message, onRetry }: StatsErrorNoticeProps) {
  return (
    <section className="px-[4%] pt-4">
      <div className="mx-auto max-w-7xl">
        <div
          role="status"
          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#3A2A1A] bg-[#140F0A] px-5 py-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <TriangleAlert size={18} className="shrink-0 text-[#E5A33D]" />
            <span className="font-dm-mono text-[12px] text-[#C9A97B]">{message}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3A2A1A] px-3 py-1.5 font-dm-mono text-[12px] text-[#E5A33D] transition-colors hover:bg-[#1C1510]"
          >
            <RotateCw size={13} />
            Retry
          </button>
        </div>
      </div>
    </section>
  );
}
