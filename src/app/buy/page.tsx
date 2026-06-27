import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { CopyButton } from "@/components/ui/CopyButton";
import { config } from "@/lib/constants/config";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Buy ORVX — Orvix",
  description: "How to acquire ORVX, the staking and governance token of the Orvix network.",
};

const STEPS = [
  {
    title: "Get a Solana wallet",
    body: "Install Phantom, Solflare, or any Solana wallet, and fund it with SOL for fees and USDC to swap.",
  },
  {
    title: "Swap for ORVX",
    body: "Use a Solana DEX to swap USDC or SOL for ORVX using the mint address below. Always verify the mint before swapping.",
  },
  {
    title: "Stake to earn",
    body: "Stake your ORVX from the dashboard to unlock fee discounts and governance voting power.",
  },
];

export default function BuyPage() {
  const mint = config.orvxMint || "TBA";

  return (
    <PublicShell>
      <PageIntro
        eyebrow="buy"
        title="Get ORVX"
        lead="ORVX is the staking and governance token of the Orvix network. Acquire it on Solana, then stake it to lower your fees and steer the network."
      />

      <Section title="Token">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-muted">Mint address</span>
          <code className="font-mono text-xs text-text-primary">{mint}</code>
          {config.orvxMint && <CopyButton value={config.orvxMint} />}
        </div>
        <p className="text-xs text-text-tertiary">
          Always confirm the mint address from an official source before swapping.
        </p>
      </Section>

      <Section title="How to buy">
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-mono text-sm text-text-muted">0{i + 1}</span>
              <div>
                <p className="text-text-primary">{step.title}</p>
                <p className="mt-1 text-text-secondary">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Learn about staking <ArrowRight size={14} />
          </Link>
          <Link
            href="/tokenomics"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Read the tokenomics
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
