"use client";

import { useState } from "react";
import { Coins, Plus, Minus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StakeDialog } from "@/components/dashboard/staking/StakeDialog";
import { UnstakeDialog } from "@/components/dashboard/staking/UnstakeDialog";
import { RewardsHistory } from "@/components/dashboard/staking/RewardsHistory";
import { useGetStakingStatusQuery } from "@/lib/store/api/stakingApi";
import { useGetTierQuery } from "@/lib/store/api/accountApi";
import { formatDateTime } from "@/lib/utils/format";

export default function StakingPage() {
  const [stakeOpen, setStakeOpen] = useState(false);
  const [unstakeOpen, setUnstakeOpen] = useState(false);
  const { data: status, isLoading } = useGetStakingStatusQuery();
  const { data: tier, isLoading: tierLoading } = useGetTierQuery();

  const staked = status?.staked_orvx ?? "0";
  const nextTier = status?.next_tier ?? tier?.next_tier ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staking"
        subtitle="Stake ORVX to unlock fee discounts and voting power."
        actions={
          <>
            <Button variant="primary" onClick={() => setStakeOpen(true)}>
              <Plus size={14} /> Stake
            </Button>
            <Button
              variant="secondary"
              onClick={() => setUnstakeOpen(true)}
              disabled={Number(staked) <= 0}
            >
              <Minus size={14} /> Unstake
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Staked ORVX" value={staked} loading={isLoading} />
        <StatCard
          label="Tier"
          value={status?.tier ?? tier?.tier ?? "—"}
          hint={tier ? `${tier.discount_pct}% discount` : undefined}
          loading={isLoading && tierLoading}
        />
        <StatCard
          label="Next tier"
          value={nextTier ? nextTier.name : "max"}
          hint={nextTier ? `${nextTier.additional_needed} ORVX more` : "highest tier reached"}
          loading={isLoading}
        />
        <StatCard
          label="Locked until"
          value={status?.stake_locked_until ? formatDateTime(status.stake_locked_until) : "—"}
          hint={status?.stake_locked_until ? undefined : "no active lock"}
          loading={isLoading}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Stake history</h2>
        {isLoading ? (
          <Card className="h-32 animate-pulse" />
        ) : !status || status.history.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="No staking activity yet"
            description="Stake ORVX to raise your tier and start earning fee discounts."
          />
        ) : (
          <Card className="divide-y divide-border p-0">
            {status.history.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="capitalize text-text-primary">{item.type.replace(/_/g, " ")}</span>
                  <span className="font-mono text-xs text-text-muted">
                    {formatDateTime(item.created_at)}
                    {item.reason ? ` · ${item.reason}` : ""}
                  </span>
                </div>
                <span className="font-mono text-text-secondary">{item.amount} ORVX</span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Network buybacks &amp; burns</h2>
        <p className="text-xs text-text-tertiary">
          The protocol uses a share of revenue to buy ORVX from the market and periodically burn it.
        </p>
        <RewardsHistory />
      </section>

      <StakeDialog open={stakeOpen} onClose={() => setStakeOpen(false)} />
      <UnstakeDialog open={unstakeOpen} onClose={() => setUnstakeOpen(false)} staked={staked} />
    </div>
  );
}
