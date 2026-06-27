"use client";

import { useState } from "react";
import { Receipt, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useGetTransactionsQuery } from "@/lib/store/api/billingApi";
import { formatDateTime } from "@/lib/utils/format";
import { explorerTxUrl } from "@/lib/utils/solana";
import { config } from "@/lib/constants/config";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 10;

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (["confirmed", "completed", "success", "succeeded"].includes(s)) return "text-success";
  if (["failed", "error", "rejected"].includes(s)) return "text-danger";
  return "text-warning";
}

export function TransactionsTable() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, isError } = useGetTransactionsQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  if (isLoading) {
    return (
      <Card className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Receipt}
        title="Couldn’t load transactions"
        description="Please refresh and try again."
      />
    );
  }

  if (!data || (data.length === 0 && page === 0)) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Your top-ups and inference charges will appear here."
      />
    );
  }

  const hasNext = data.length === PAGE_SIZE;

  return (
    <div className="space-y-3">
      <Card className={cn("divide-y divide-border p-0", isFetching && "opacity-60")}>
        {data.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <div className="flex min-w-0 flex-col">
              <span className="capitalize text-text-primary">{tx.type.replace(/_/g, " ")}</span>
              <span className="font-mono text-xs text-text-muted">
                {formatDateTime(tx.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {tx.solana_signature && (
                <a
                  href={explorerTxUrl(tx.solana_signature, config.solanaNetwork)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted transition-colors hover:text-text-secondary"
                  aria-label="View on Solscan"
                >
                  <ExternalLink size={13} />
                </a>
              )}
              <span className="font-mono text-text-secondary">
                {tx.amount} {tx.token}
              </span>
              <span className={cn("font-mono text-xs capitalize", statusColor(tx.status))}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {(page > 0 || hasNext) && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>page {page + 1}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="px-2 py-1"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              className="px-2 py-1"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
