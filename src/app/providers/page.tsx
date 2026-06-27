import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { Terminal } from "@/components/ui/Terminal";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Providers — Orvix",
  description:
    "Earn USDC with your idle GPU. Connect a CUDA GPU to the Orvix network and get paid per completed job, settled on-chain in real time.",
};

const STEPS = [
  {
    title: "Install the node client",
    body: "One command pulls the client and registers your machine with the orchestrator.",
  },
  {
    title: "Connect your GPU",
    body: "The client benchmarks your hardware, assigns a tier, and starts advertising capacity to the network.",
  },
  {
    title: "Receive jobs",
    body: "The orchestrator routes inference requests to you based on tier, load, and locality.",
  },
  {
    title: "Get paid in USDC",
    body: "You earn a share of every completed request, settled on-chain in real time — no platform middleman.",
  },
];

const REQUIREMENTS = [
  "NVIDIA GPU with CUDA support (RTX 3090 / 4000-series or better recommended)",
  "Linux host with a stable connection and a public-reachable endpoint",
  "A Solana wallet to receive USDC payouts",
  "Docker, or the standalone node binary",
];

export default function ProvidersPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="providers"
        title="Earn USDC with your idle GPU"
        lead="Orvix turns spare GPU capacity into income. Connect a machine, serve inference for the network, and get paid in USDC for every completed job — settled on-chain, with no intermediary taking a cut."
      />

      <section className="pb-8">
        <Terminal
          title="get started"
          command="curl -fsSL https://get.orvix.xyz/node | sh"
          lines={[
            "✓ downloading orvix-node",
            "✓ detected GPU: NVIDIA RTX 4090 (24 GB)",
            "✓ benchmark complete — tier=gold",
            "✓ registered node 1c101f60 with orchestrator",
            "→ awaiting jobs…",
          ]}
          cursor
        />
      </section>

      <Section title="How it works">
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
      </Section>

      <Section title="Economics">
        <p>
          Providers earn <span className="text-text-primary">70% of revenue</span> on every request
          they serve. Payouts are in USDC and settle on-chain in real time — you can verify each
          payment on Solana. Staking ORVX raises your tier, which improves routing priority and your
          effective rate.
        </p>
      </Section>

      <Section title="Requirements">
        <ul className="space-y-2">
          {REQUIREMENTS.map((req) => (
            <li key={req} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm">
          <Link
            href={routes.docs}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Read the provider docs <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.staking}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Learn about staking tiers
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
