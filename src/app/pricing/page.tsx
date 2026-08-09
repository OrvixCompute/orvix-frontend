import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Pricing — Orvix",
  description:
    "Transparent, per-token pricing in USDC. Up to 17x cheaper than hosted incumbents, with no rate-limit games.",
};

// Per 1K tokens in USDC, mirroring the orchestrator's PRICING table.
const ROWS = [
  { model: "qwen-2.5-7b", input: "$0.0001", output: "$0.0002", status: "live" },
  { model: "mistral-7b", input: "$0.0001", output: "$0.0002", status: "in catalog" },
  { model: "llama-3.1-8b-quantized", input: "$0.00008", output: "$0.00016", status: "in catalog" },
];

const TIERS = [
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
        lead="Every request is metered per token and billed in USDC on Solana. No subscriptions, no rate-limit games — typically up to 17x cheaper than hosted incumbents."
      />

      <Section title="Per-token pricing">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">model</th>
                <th className="py-2 pr-6 text-left font-normal">input</th>
                <th className="py-2 pr-6 text-left font-normal">output</th>
                <th className="py-2 text-left font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.model} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{row.model}</td>
                  <td className="py-2 pr-6">{row.input}</td>
                  <td className="py-2 pr-6">{row.output}</td>
                  <td className="py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-tertiary">
          Prices are per 1K tokens, settled in USDC. &ldquo;In catalog&rdquo; means the model is
          priced and ready but no node is serving it right now —{" "}
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
        <div className="overflow-x-auto">
          <table className="w-full max-w-md font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">unit</th>
                <th className="py-2 text-left font-normal">price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border text-text-secondary">
                <td className="py-2 pr-6 text-text-primary">per megapixel</td>
                <td className="py-2">0.05 USDC</td>
              </tr>
              <tr className="border-t border-border text-text-secondary">
                <td className="py-2 pr-6 text-text-primary">1024 × 1024 image</td>
                <td className="py-2">≈ 0.05 USDC</td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div className="overflow-x-auto">
          <table className="w-full max-w-xl font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">tier</th>
                <th className="py-2 pr-6 text-left font-normal">stake</th>
                <th className="py-2 pr-6 text-left font-normal">discount</th>
                <th className="py-2 text-left font-normal">rate limit</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.tier} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{t.tier}</td>
                  <td className="py-2 pr-6">{t.stake}</td>
                  <td className="py-2 pr-6">{t.discount}</td>
                  <td className="py-2">{t.rpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
