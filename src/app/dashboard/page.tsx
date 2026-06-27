"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetBalanceQuery, useGetTransactionsQuery } from "@/lib/store/api/billingApi";
import { useGetTierQuery } from "@/lib/store/api/accountApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { GetStarted } from "@/components/dashboard/GetStarted";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { dashboardRoutes } from "@/lib/constants/routes";
import { truncateAddress } from "@/lib/utils/solana";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const QUICK_ACTIONS = [
  { label: "Top up", href: dashboardRoutes.billing },
  { label: "Get API key", href: dashboardRoutes.apiKeys },
  { label: "Test inference", href: dashboardRoutes.playground },
];

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (["confirmed", "completed", "success", "succeeded"].includes(s)) return "text-success";
  if (["failed", "error", "rejected"].includes(s)) return "text-danger";
  return "text-warning";
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { data: balance, isLoading: balanceLoading } = useGetBalanceQuery();
  const { data: tier, isLoading: tierLoading } = useGetTierQuery();
  const { data: txns, isLoading: txnsLoading } = useGetTransactionsQuery({ limit: 10 });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle={user ? `Signed in as ${truncateAddress(user.wallet)}` : undefined}
      />

      <GetStarted />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="USDC balance"
          value={balance ? `$${balance.balance_usdc}` : "—"}
          loading={balanceLoading}
        />
        <StatCard
          label="Tier"
          value={tier ? tier.tier : (user?.tier ?? "—")}
          hint={tier ? `${tier.discount_pct}% discount` : undefined}
          loading={tierLoading}
        />
        <StatCard
          label="Staked ORVX"
          value={tier ? tier.staked_orvx : "—"}
          loading={tierLoading}
        />
        <StatCard
          label="Recent transactions"
          value={txns ? String(txns.length) : "—"}
          hint="last 10"
          loading={txnsLoading}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button variant="secondary">{action.label}</Button>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Recent activity</h2>
        {txnsLoading ? (
          <Card className="h-40 animate-pulse" />
        ) : !txns || txns.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Your inference charges and top-ups will appear here once you start using the network."
          >
            <Link href={dashboardRoutes.billing}>
              <Button variant="secondary">
                Top up balance <ArrowRight size={14} />
              </Button>
            </Link>
          </EmptyState>
        ) : (
          <Card className="divide-y divide-border p-0">
            {txns.map((tx) => (
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
        )}
      </section>
    </div>
  );
}
