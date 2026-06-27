import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Tokenomics — Orvix",
  description:
    "ORVX powers the Orvix network: staking for fee discounts and governance, funded by a revenue-driven buyback and burn.",
};

const SPLIT = [
  { label: "provider", share: "70%", note: "paid to the GPU operator who served the request" },
  { label: "buyback", share: "20%", note: "buys ORVX from the open market" },
  { label: "treasury", share: "10%", note: "funds development and network operations" },
];

export default function TokenomicsPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="tokenomics"
        title="ORVX, powered by real revenue"
        lead="ORVX is the network's coordination asset. It is used for staking and governance, and the protocol uses a share of every request's revenue to buy ORVX back from the market and burn it."
      />

      <Section title="Utility">
        <p>
          <span className="text-text-primary">Staking</span> — lock ORVX to unlock provider and
          consumer fee discount tiers, and to raise provider routing priority.
        </p>
        <p>
          <span className="text-text-primary">Governance</span> — staked ORVX is voting power over
          network parameters, supported models, and treasury spend.
        </p>
      </Section>

      <Section title="Revenue split">
        <p>Every paid request divides its revenue three ways, on-chain and in real time:</p>
        <div className="overflow-x-auto">
          <table className="w-full max-w-lg font-mono text-xs">
            <tbody>
              {SPLIT.map((s) => (
                <tr key={s.label} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{s.label}</td>
                  <td className="py-2 pr-6 text-text-primary">{s.share}</td>
                  <td className="py-2">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Buyback and burn">
        <p>
          The buyback budget purchases ORVX from the open market. Acquired tokens are periodically
          burned, permanently reducing supply. Both buybacks and burns settle on Solana and are
          publicly verifiable — the network&apos;s economics are auditable, not asserted.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Stake ORVX <ArrowRight size={14} />
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
