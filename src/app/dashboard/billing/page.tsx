"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { TopupDialog } from "@/components/dashboard/billing/TopupDialog";
import { PendingIntents } from "@/components/dashboard/billing/PendingIntents";
import { TransactionsTable } from "@/components/dashboard/billing/TransactionsTable";
import { useGetBalanceQuery, useListTopupIntentsQuery } from "@/lib/store/api/billingApi";
import { useGetTierQuery } from "@/lib/store/api/accountApi";

export default function BillingPage() {
  const [topupOpen, setTopupOpen] = useState(false);
  const { data: balance, isLoading: balanceLoading } = useGetBalanceQuery();
  const { data: tier, isLoading: tierLoading } = useGetTierQuery();
  const { data: intents } = useListTopupIntentsQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        subtitle="Top up your USDC balance and review transactions."
        actions={
          <Button variant="primary" onClick={() => setTopupOpen(true)}>
            <Plus size={14} /> Top up
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          label="USDC balance"
          value={balance ? `$${balance.balance_usdc}` : "—"}
          loading={balanceLoading}
        />
        <StatCard
          label="Tier"
          value={balance?.tier ?? tier?.tier ?? "—"}
          hint={tier ? `${tier.discount_pct}% discount` : undefined}
          loading={balanceLoading && tierLoading}
        />
        <StatCard
          label="Pending top-ups"
          value={intents ? String(intents.length) : "—"}
          hint="awaiting transfer"
        />
      </div>

      {intents && intents.length > 0 && <PendingIntents intents={intents} />}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Transactions</h2>
        <TransactionsTable />
      </section>

      <TopupDialog open={topupOpen} onClose={() => setTopupOpen(false)} />
    </div>
  );
}
