import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "About — Orvix",
  description:
    "Orvix is the open compute layer for AI — a permissionless GPU network with OpenAI-compatible inference, USDC settlement, and on-chain transparency.",
};

const PRINCIPLES = [
  {
    title: "Permissionless",
    body: "Anyone can connect a GPU and serve inference, and anyone can consume it. There is no gatekeeper deciding who participates.",
  },
  {
    title: "OpenAI-compatible",
    body: "The API mirrors the OpenAI surface, so existing tools and SDKs work unchanged. Migration is a base URL and a key.",
  },
  {
    title: "Settled in USDC",
    body: "Every request is metered and billed in USDC on Solana. Providers are paid in real time, and flows are publicly verifiable.",
  },
  {
    title: "Transparent by default",
    body: "Pricing, payouts, buybacks, and treasury activity are on-chain. The network's economics are auditable, not asserted.",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="about"
        title="The open compute layer for AI"
        lead="Orvix is a decentralized AI compute network. Inference runs on a permissionless GPU network, every request is metered on-chain, every provider is paid in USDC, and the system buys back ORVX from its own revenue."
      />

      <Section title="What Orvix is">
        <p>
          Orvix is not a chatbot and not a hosted API. It is an open coordination layer that
          connects the people who need AI compute with the people who have GPUs to supply it. The
          orchestrator handles routing, metering, and settlement; the market sets capacity and
          price.
        </p>
        <p>
          The result is OpenAI-compatible inference at a fraction of incumbent pricing, without
          depending on a single provider.
        </p>
      </Section>

      <Section title="How the system works">
        <p>
          A developer sends a request with an API key. The orchestrator routes it to an available
          provider, meters the tokens, and bills the developer&apos;s USDC balance. Revenue is split
          between the provider, a buyback of ORVX from the open market, and the treasury — all on
          Solana, in real time.
        </p>
        <p>
          ORVX holders stake to unlock discount tiers and to govern the network&apos;s parameters,
          supported models, and treasury spend.
        </p>
      </Section>

      <section className="border-t border-border py-8">
        <h2 className="text-lg font-medium">Principles</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <p className="text-text-primary">{p.title}</p>
              <p className="mt-1 max-w-md text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Section title="Get involved">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href={routes.playground}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Try the playground <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.providers}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Become a provider
          </Link>
          <Link
            href={routes.docs}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Read the docs
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
