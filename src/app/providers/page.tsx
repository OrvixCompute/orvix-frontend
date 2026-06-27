import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, ExternalLink } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Providers — Orvix",
  description:
    "Earn USDC with your idle GPU. Provider onboarding is currently early access and manual — apply via GitHub.",
};

const GITHUB_REPO = "https://github.com/OrvixCompute/orvix";
const GITHUB_APPLY = "https://github.com/OrvixCompute/orvix/issues/new";

const STEPS = [
  {
    title: "Apply",
    body: "Open a GitHub issue with your GPU model, VRAM, location, and connection. We review and reach out.",
  },
  {
    title: "Get onboarded",
    body: "We coordinate setup directly with you while the self-serve node client is in development.",
  },
  {
    title: "Run your node",
    body: "Your machine registers with the orchestrator and starts receiving inference jobs.",
  },
  {
    title: "Get paid in USDC",
    body: "You earn a share of every completed request, settled on-chain — no platform middleman.",
  },
];

const REQUIREMENTS = [
  "NVIDIA GPU with CUDA support (RTX 3090 / 4000-series or better recommended)",
  "Linux host with a stable connection and a public-reachable endpoint",
  "A Solana wallet to receive USDC payouts",
  "Comfort running a long-lived service (Docker or systemd)",
];

export default function ProvidersPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="providers"
        title="Earn USDC with your idle GPU"
        lead="Orvix turns spare GPU capacity into income — connect a machine, serve inference, and get paid in USDC for every completed job. Provider onboarding is early access and handled manually for now."
      />

      <section className="pb-8">
        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Early access</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              There is no public node installer yet. We&apos;re onboarding providers manually while
              the self-serve client is built. To join, open a GitHub issue with your hardware
              details and we&apos;ll follow up.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={GITHUB_APPLY} target="_blank" rel="noreferrer">
              <span className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
                <Github size={14} /> Apply on GitHub
              </span>
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
              <span className="inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary">
                View the project <ExternalLink size={14} />
              </span>
            </a>
          </div>
        </Card>
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
          they serve. Payouts are in USDC and settle on-chain — you can verify each payment on
          Solana. Staking ORVX raises your tier, which improves routing priority and your effective
          rate.
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
          <a
            href={GITHUB_APPLY}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Apply to run a node <ArrowRight size={14} />
          </a>
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
