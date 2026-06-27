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

const ROWS = [
  { model: "qwen-2.5-7b", input: "$0.00", output: "$0.00", vs: "17x cheaper" },
  { model: "llama-3-8b", input: "soon", output: "soon", vs: "—" },
];

const TIERS = [
  { tier: "bronze", stake: "0 ORVX", discount: "0%" },
  { tier: "silver", stake: "10,000 ORVX", discount: "5%" },
  { tier: "gold", stake: "50,000 ORVX", discount: "15%" },
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
                <th className="py-2 text-left font-normal">vs OpenAI</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.model} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{row.model}</td>
                  <td className="py-2 pr-6">{row.input}</td>
                  <td className="py-2 pr-6">{row.output}</td>
                  <td className="py-2">{row.vs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-tertiary">Prices are per 1K tokens, settled in USDC.</p>
      </Section>

      <Section title="How billing works">
        <p>
          Top up a USDC balance, create an API key, and start making requests. Each completed
          request deducts the exact metered cost — you can audit every charge on-chain. There are no
          minimums and no monthly fees.
        </p>
      </Section>

      <Section title="Stake for lower fees">
        <p>Staking ORVX unlocks discount tiers that apply to every request you make.</p>
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
