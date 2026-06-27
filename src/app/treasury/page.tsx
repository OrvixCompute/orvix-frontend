import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { CopyButton } from "@/components/ui/CopyButton";
import { config } from "@/lib/constants/config";

export const metadata: Metadata = {
  title: "Treasury — Orvix",
  description:
    "The Orvix treasury is funded by a share of network revenue and used to sustain development and operations.",
};

export default function TreasuryPage() {
  const address = config.treasuryAddress || "TBA";

  return (
    <PublicShell>
      <PageIntro
        eyebrow="treasury"
        title="Network treasury"
        lead="A share of every request's revenue flows to the treasury, which funds development and operations. Like the rest of the protocol, its activity is on-chain and verifiable."
      />

      <Section title="Address">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-muted">Treasury wallet</span>
          <code className="font-mono text-xs text-text-primary">{address}</code>
          {config.treasuryAddress && <CopyButton value={config.treasuryAddress} />}
        </div>
      </Section>

      <Section title="Funding">
        <p>
          Each paid request directs 10% of its revenue to the treasury, alongside 70% to the
          provider and 20% to the ORVX buyback. Treasury allocation is governed by stake-weighted
          voting.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href="/tokenomics"
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            View tokenomics <ArrowRight size={14} />
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
