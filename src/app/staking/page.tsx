import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { dashboardRoutes, routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Staking — Orvix",
  description:
    "Stake ORVX to unlock fee discount tiers, raise provider priority, and gain governance voting power.",
};

const TIERS = [
  { tier: "bronze", stake: "0 ORVX", discount: "0%" },
  { tier: "silver", stake: "10,000 ORVX", discount: "5%" },
  { tier: "gold", stake: "50,000 ORVX", discount: "15%" },
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
        <div className="overflow-x-auto">
          <table className="w-full max-w-md font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">tier</th>
                <th className="py-2 pr-6 text-left font-normal">stake</th>
                <th className="py-2 text-left font-normal">discount</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.tier} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{t.tier}</td>
                  <td className="py-2 pr-6">{t.stake}</td>
                  <td className="py-2">{t.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
