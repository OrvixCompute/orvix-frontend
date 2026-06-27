import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Whitepaper — Orvix",
  description:
    "The Orvix whitepaper: an open, permissionless compute network for AI with on-chain metering and USDC settlement.",
};

export default function WhitepaperPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="whitepaper"
        title="The Orvix protocol"
        lead="Orvix coordinates supply and demand for AI compute without a central provider. This page summarizes the architecture, economics, and governance; the full technical paper is published alongside the protocol."
      />

      <Section title="Abstract">
        <p>
          AI inference today depends on a handful of centralized providers. Orvix replaces that with
          an open market: independent operators contribute GPUs, an orchestrator routes and meters
          work, and settlement happens in USDC on Solana. The result is an OpenAI-compatible API
          with transparent pricing and verifiable payouts.
        </p>
      </Section>

      <Section title="Architecture">
        <p>
          A stateless orchestrator accepts OpenAI-compatible requests, authenticates the caller,
          and dispatches each job to an eligible provider based on tier, load, and locality. Tokens
          are metered, the caller&apos;s USDC balance is charged, and the provider is paid — all
          recorded on-chain.
        </p>
      </Section>

      <Section title="Economics">
        <p>
          Each request&apos;s revenue is split between the provider, a market buyback of ORVX, and
          the treasury. Staking ORVX unlocks discount tiers and routing priority. A portion of
          bought-back ORVX is periodically burned, tying token supply to real network usage.
        </p>
      </Section>

      <Section title="Governance">
        <p>
          Network parameters, supported models, and treasury spend are decided by stake-weighted
          voting on Snapshot — gasless and verifiable. Influence scales with committed stake, not
          with capital sitting idle.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.docs}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Read the docs <ArrowRight size={14} />
          </Link>
          <Link
            href="/tokenomics"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            View tokenomics
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
