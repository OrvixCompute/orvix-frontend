import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Changelog — Orvix",
  description: "Notable updates to the Orvix network and dashboard.",
};

const ENTRIES = [
  {
    version: "v0.2.0",
    date: "2026",
    items: [
      "Orchestrator live with OpenAI-compatible chat completions and streaming.",
      "USDC billing: balance, metered charges, and top-up via memo.",
      "Staking with discount tiers, plus on-chain buyback and burn.",
    ],
  },
  {
    version: "frontend",
    date: "2026",
    items: [
      "Dashboard: API keys, billing, playground, staking, governance, settings.",
      "Public site: docs, providers, pricing, tokenomics, and more.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="changelog"
        title="What's new"
        lead="Notable updates to the Orvix network and dashboard."
      />
      <div className="space-y-8 pb-4">
        {ENTRIES.map((entry) => (
          <section key={entry.version} className="border-t border-border pt-6">
            <div className="flex items-baseline gap-3">
              <h2 className="font-mono text-sm text-text-primary">{entry.version}</h2>
              <span className="font-mono text-xs text-text-muted">{entry.date}</span>
            </div>
            <ul className="mt-3 max-w-2xl space-y-2">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-text-secondary">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
