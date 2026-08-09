"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useListWithdrawalsQuery } from "@/lib/store/api/providerApi";
import { formatDateTime, formatUsdcAmount } from "@/lib/utils/format";
import { truncateAddress } from "@/lib/utils/solana";
import { cn } from "@/lib/utils/cn";

const STATUS_CLASS: Record<string, string> = {
  completed: "border-success/30 text-success",
  queued: "border-warning/30 text-warning",
  processing: "border-warning/30 text-warning",
  failed: "border-danger/30 text-danger",
  rejected: "border-danger/30 text-danger",
};

export function WithdrawalsTable() {
  const { data: withdrawals, isLoading, isError } = useListWithdrawalsQuery();

  if (isLoading) {
    return (
      <Card className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </Card>
    );
  }

  // A failed history read is not worth a scary error block next to a working
  // withdraw button — the payout path itself is unaffected.
  if (isError) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-tertiary">
        Couldn’t load withdrawal history. Refresh to try again.
      </p>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-tertiary">
        No withdrawals yet. Payouts you request appear here with their Solana signature once they
        settle.
      </p>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[34rem] font-mono text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="px-4 py-2 text-left font-normal">amount</th>
            <th className="px-4 py-2 text-left font-normal">destination</th>
            <th className="px-4 py-2 text-left font-normal">status</th>
            <th className="px-4 py-2 text-right font-normal">requested</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id} className="border-t border-border text-text-secondary">
              <td className="px-4 py-2 text-text-primary">{formatUsdcAmount(w.amount)}</td>
              <td className="px-4 py-2">
                {w.destination_wallet ? truncateAddress(w.destination_wallet) : "—"}
              </td>
              <td className="px-4 py-2">
                <Badge className={cn(STATUS_CLASS[w.status] ?? "text-text-muted")}>
                  {w.status}
                </Badge>
                {w.metadata?.manual_approval_required && (
                  <span className="ml-2 text-[10px] text-text-tertiary">manual review</span>
                )}
              </td>
              <td className="px-4 py-2 text-right">{formatDateTime(w.queued_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
