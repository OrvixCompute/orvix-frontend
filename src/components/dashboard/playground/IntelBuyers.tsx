"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { TruncatedAddress } from "@/components/dashboard/playground/intel-shared";
import type { IntelData, EarlyBuyer } from "@/components/dashboard/playground/TokenIntel";

function relativeTime(blockTime: number | null): string {
  if (!blockTime) return "—";
  const diff = Date.now() / 1000 - blockTime;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function solscanTxUrl(sig: string): string {
  return `https://solscan.io/tx/${sig}`;
}

export function IntelBuyers({ data, pending }: { data: IntelData; pending: Set<string> }) {
  const buyers = data.earlyBuyers;
  const buyersLoading = pending.has("earlyBuyers");

  if (buyersLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary py-16 text-xs text-text-muted">
        <Loader2 size={14} className="animate-spin" /> Loading early buyers...
      </div>
    );
  }

  if (!buyers || buyers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-bg-secondary py-16 text-center">
        <p className="text-sm text-text-tertiary">No early buyer data available</p>
      </div>
    );
  }

  // Sort oldest first
  const sorted = [...buyers].sort((a, b) => (a.block_time ?? 0) - (b.block_time ?? 0));

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-text-muted">
        Early Buyers ({sorted.length})
      </div>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

        {sorted.map((buyer, i) => (
          <TimelineEntry key={buyer.signature + i} buyer={buyer} />
        ))}
      </div>
    </div>
  );
}

function TimelineEntry({ buyer }: { buyer: EarlyBuyer }) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Dot */}
      <div className="relative z-10 mt-1.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-accent" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 rounded border border-border bg-bg-tertiary p-3">
        <div className="flex flex-wrap items-center gap-2">
          <TruncatedAddress address={buyer.wallet} />
          <span className="text-[11px] text-text-muted">{relativeTime(buyer.block_time)}</span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-text-primary">{buyer.amount.toLocaleString()} tokens</span>
          <a
            href={solscanTxUrl(buyer.signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Solscan <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
