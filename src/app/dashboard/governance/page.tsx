"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useGetSnapshotUrlQuery } from "@/lib/store/api/governanceApi";
import { useGetStakingStatusQuery } from "@/lib/store/api/stakingApi";
import { dashboardRoutes } from "@/lib/constants/routes";

export default function GovernancePage() {
  const { data: snapshot, isLoading: snapshotLoading } = useGetSnapshotUrlQuery();
  const { data: status, isLoading: statusLoading } = useGetStakingStatusQuery();

  const votingPower = status?.staked_orvx ?? "0";
  const hasPower = Number(votingPower) > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Governance"
        subtitle="Steer the network. Proposals and voting run on Snapshot, weighted by staked ORVX."
        actions={
          snapshot && (
            <a href={snapshot.url} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">
                Open Snapshot <ExternalLink size={14} />
              </Button>
            </a>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Voting power" value={votingPower} hint="staked ORVX" loading={statusLoading} />
        <StatCard label="Space" value={snapshot?.space ?? "—"} loading={snapshotLoading} />
        <StatCard label="Tier" value={status?.tier ?? "—"} loading={statusLoading} />
      </div>

      {!hasPower && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            You have no voting power yet. Stake ORVX to participate in governance.
          </p>
          <Link href={dashboardRoutes.staking}>
            <Button variant="secondary">
              Stake ORVX <ArrowUpRight size={14} />
            </Button>
          </Link>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary">How governance works</h2>
        <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
          <div className="border-t border-border pt-4">
            <p className="text-text-primary">Off-chain voting on Snapshot</p>
            <p className="mt-1">
              Proposals are created and voted on in the{" "}
              <span className="font-mono text-text-primary">{snapshot?.space ?? "orvix"}</span>{" "}
              Snapshot space. Voting is gasless — you sign a message with the wallet that holds your
              stake.
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-primary">Stake-weighted votes</p>
            <p className="mt-1">
              One staked ORVX equals one vote. Increasing your stake raises both your fee tier and
              your influence over network parameters, treasury spend, and supported models.
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-primary">Submitting a proposal</p>
            <p className="mt-1">
              Any holder meeting the space&apos;s threshold can open a proposal directly on Snapshot.
              Discussion happens in the community channels linked from the space.
            </p>
          </div>
        </div>

        {snapshot && (
          <a
            href={snapshot.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-text-primary underline underline-offset-4"
          >
            View proposals on Snapshot <ExternalLink size={13} />
          </a>
        )}
      </section>
    </div>
  );
}
