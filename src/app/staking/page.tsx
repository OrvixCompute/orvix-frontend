import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { DocsTable } from "@/components/docs/DocsTable";
import { dashboardRoutes, routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Staking — Orvix",
  description:
    "Stake ORVX to unlock fee discount tiers, raise provider priority, and gain governance voting power.",
};

interface Tier {
  tier: string;
  stake: string;
  discount: string;
}

const TIERS: Tier[] = [
  { tier: "bronze", stake: "0 ORVX", discount: "0%" },
  { tier: "silver", stake: "10,000 ORVX", discount: "5%" },
  { tier: "gold", stake: "50,000 ORVX", discount: "15%" },
  { tier: "diamond", stake: "250,000 ORVX", discount: "25%" },
];

export default function StakingPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="staking"
        title="Stake ORVX, earn your tier"
        lead="Staking ORVX lowers your inference fees, raises provider routing priority, and gives you a vote in how the network evolves. Lock once, benefit on every request."
      />

      <Section title="Tiers">
        <DocsTable
          columns={[
            { header: "tier", cell: (t: Tier) => t.tier, emphasis: true },
            { header: "stake", cell: (t: Tier) => t.stake },
            { header: "discount", cell: (t: Tier) => t.discount },
          ]}
          rows={TIERS}
          rowKey={(t) => t.tier}
        />
      </Section>

      <Section title="How it works">
        <p>
          Generate a stake deposit from the dashboard and send ORVX with the provided memo. Your
          tier updates once the transfer confirms on-chain. Unstaking returns your ORVX to your
          wallet, subject to any active lock period.
        </p>
        <p>
          Staked ORVX also counts as governance voting power — one staked ORVX is one vote on
          Snapshot.
        </p>
        <p className="pt-1 text-sm">
          <Link
            href={routes.roadmap}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            What else staking will unlock <ArrowRight size={14} />
          </Link>{" "}
          <span className="text-text-tertiary">— marked live or coming soon, item by item.</span>
        </p>
      </Section>

      <Section title="Start staking">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href={dashboardRoutes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Open the staking dashboard <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.buy}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Buy ORVX
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
