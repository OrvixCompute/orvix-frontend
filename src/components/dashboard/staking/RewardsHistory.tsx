"use client";

import { Flame, Repeat, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetBuybackHistoryQuery, useGetBurnHistoryQuery } from "@/lib/store/api/stakingApi";
import { formatDateTime } from "@/lib/utils/format";
import { explorerTxUrl } from "@/lib/utils/solana";
import { config } from "@/lib/constants/config";

function TxLink({ signature }: { signature: string }) {
  return (
    <a
      href={explorerTxUrl(signature, config.solanaNetwork)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-muted transition-colors hover:text-text-secondary"
      aria-label="View on Solscan"
    >
      <ExternalLink size={13} />
    </a>
  );
}

export function RewardsHistory() {
  const { data: buybacks, isLoading: buybacksLoading } = useGetBuybackHistoryQuery(5);
  const { data: burns, isLoading: burnsLoading } = useGetBurnHistoryQuery(5);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Repeat size={14} className="text-text-muted" />
          Recent buybacks
        </h2>
        {buybacksLoading ? (
          <Card className="space-y-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </Card>
        ) : !buybacks || buybacks.length === 0 ? (
          <Card className="text-xs text-text-tertiary">No buybacks yet.</Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {buybacks.map((b) => (
              <div key={b.solana_signature} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                <div className="flex flex-col">
                  <span className="font-mono text-text-primary">{b.orvx_received} ORVX</span>
                  <span className="text-text-muted">{formatDateTime(b.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-text-secondary">${b.usdc_spent}</span>
                  <TxLink signature={b.solana_signature} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Flame size={14} className="text-text-muted" />
          Recent burns
        </h2>
        {burnsLoading ? (
          <Card className="space-y-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </Card>
        ) : !burns || burns.length === 0 ? (
          <Card className="text-xs text-text-tertiary">No burns yet.</Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {burns.map((b) => (
              <div key={b.solana_signature} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                <div className="flex flex-col">
                  <span className="font-mono text-text-primary">{b.orvx_burned} ORVX</span>
                  <span className="text-text-muted">{formatDateTime(b.created_at)}</span>
                </div>
                <TxLink signature={b.solana_signature} />
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
