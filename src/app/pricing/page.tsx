import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { DocsTable } from "@/components/docs/DocsTable";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Pricing — Orvix",
  description:
    "Per-token pricing in USDC on Solana. 1000 free chat requests and 50 images a day to start, then metered billing with no subscription and no minimum.",
};

interface Row {
  model: string;
  input: string;
  output: string;
  perM: string;
  status: string;
}

interface Tier {
  tier: string;
  stake: string;
  discount: string;
  rpm: string;
}

// Mirrors the orchestrator's PRICING table. Shown per 1M tokens as well as per
// 1K, because per-1M is the unit every other provider quotes — a reader
// comparing us to them should not have to do the arithmetic.
const ROWS: Row[] = [
  {
    model: "qwen-2.5-7b",
    input: "$0.0001",
    output: "$0.0002",
    perM: "$0.10 / $0.20",
    status: "live",
  },
  {
    model: "mistral-7b",
    input: "$0.0001",
    output: "$0.0002",
    perM: "$0.10 / $0.20",
    status: "in catalog",
  },
  {
    model: "llama-3.1-8b-quantized",
    input: "$0.00008",
    output: "$0.00016",
    perM: "$0.08 / $0.16",
    status: "in catalog",
  },
];

const IMAGE_ROWS = [
  { unit: "per megapixel", price: "0.05 USDC" },
  { unit: "1024 × 1024 image", price: "\u2248 0.05 USDC" },
];

const TIERS: Tier[] = [
  { tier: "bronze", stake: "0 ORVX", discount: "0%", rpm: "60/min" },
  { tier: "silver", stake: "10,000 ORVX", discount: "5%", rpm: "120/min" },
  { tier: "gold", stake: "50,000 ORVX", discount: "15%", rpm: "300/min" },
  { tier: "diamond", stake: "250,000 ORVX", discount: "25%", rpm: "600/min" },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="pricing"
        title="Pay only for what you use"
        lead="Start on 1000 free chat requests and 50 images a day. After that every request is metered per token and billed in USDC on Solana — no subscription, no minimum, no monthly fee, and every charge auditable on-chain."
      />

      <Section title="Per-token pricing" wide>
        <DocsTable
          columns={[
            { header: "model", cell: (r: Row) => r.model, emphasis: true },
            { header: "input / 1K", cell: (r: Row) => r.input },
            { header: "output / 1K", cell: (r: Row) => r.output },
            { header: "per 1M (in / out)", cell: (r: Row) => r.perM },
            { header: "status", cell: (r: Row) => r.status },
          ]}
          rows={ROWS}
          rowKey={(r) => r.model}
        />
        <p className="text-xs text-text-tertiary">
          Settled in USDC. &ldquo;In catalog&rdquo; means the model is priced and ready but no node
          is serving it right now —{" "}
          <Link href={routes.docs} className="text-text-secondary hover:text-text-primary">
            GET /v1/models
          </Link>{" "}
          reports live availability.
        </p>
      </Section>

      <Section title="Image pricing">
        <p>
          Image generation is priced per megapixel and scales with area, so a 512 × 512 costs a
          quarter of a 1024 × 1024 and a 1536 × 1536 a little over twice as much.
        </p>
        <DocsTable
          columns={[
            { header: "unit", cell: (r: { unit: string; price: string }) => r.unit, emphasis: true },
            { header: "price", cell: (r: { unit: string; price: string }) => r.price },
          ]}
          rows={IMAGE_ROWS}
          rowKey={(r) => r.unit}
        />
        <p className="text-xs text-text-tertiary">
          Charged only past your free daily allowance. Generated images are deleted after 24 hours.
        </p>
      </Section>

      <Section title="Start free">
        <p>
          Every account gets <span className="text-text-primary">1000 chat requests</span> as a
          lifetime allowance and <span className="text-text-primary">50 images per day</span>,
          resetting at 00:00 UTC. Nothing is charged until that allowance runs out, and ordinary
          usage rarely reaches the paid path. Allowances are the same for everyone.
        </p>
      </Section>

      <Section title="How billing works">
        <p>
          Top up a USDC balance, create an API key, and start making requests. Each completed
          request deducts the exact metered cost — you can audit every charge on-chain. There are no
          minimums and no monthly fees.
        </p>
        <p>
          Billing is USDC-only. ORVX is never spent on fees; it changes what you pay only through
          the stake-based discount below.
        </p>
      </Section>

      <Section title="Stake for lower fees">
        <p>
          Staking ORVX unlocks tiers that apply to every request you make — a discount on the
          metered cost, and a higher per-minute ceiling. Your tier comes from staked ORVX, not from
          your wallet balance.
        </p>
        <DocsTable
          columns={[
            { header: "tier", cell: (t: Tier) => t.tier, emphasis: true },
            { header: "stake", cell: (t: Tier) => t.stake },
            { header: "discount", cell: (t: Tier) => t.discount },
            { header: "rate limit", cell: (t: Tier) => t.rpm },
          ]}
          rows={TIERS}
          rowKey={(t) => t.tier}
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Learn about staking <ArrowRight size={14} />
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
