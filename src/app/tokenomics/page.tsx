import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { DocsTable } from "@/components/docs/DocsTable";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Tokenomics — Orvix",
  description:
    "ORVX powers the Orvix network: staking for fee discounts and governance, funded by a revenue-driven buyback and burn.",
};

interface Split {
  label: string;
  share: string;
  note: string;
}

const SPLIT: Split[] = [
  { label: "provider", share: "70%", note: "paid to the GPU operator who served the request" },
  { label: "buyback", share: "20%", note: "buys ORVX from the open market" },
  { label: "treasury", share: "10%", note: "funds development and network operations" },
];

export default function TokenomicsPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="tokenomics"
        title="ORVX, powered by real revenue"
        lead="ORVX is the network's coordination asset. It is used for staking and governance, and the protocol uses a share of every request's revenue to buy ORVX back from the market and burn it."
      />

      <Section title="Utility">
        <p>
          <span className="text-text-primary">Staking</span> — lock ORVX to unlock provider and
          consumer fee discount tiers, and to raise provider routing priority.
        </p>
        <p>
          <span className="text-text-primary">Governance</span> — staked ORVX is voting power over
          network parameters, supported models, and treasury spend.
        </p>
        <p className="pt-1 text-sm">
          <Link
            href={routes.roadmap}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            The full utility roadmap <ArrowRight size={14} />
          </Link>{" "}
          <span className="text-text-tertiary">— what is live today, and what is planned.</span>
        </p>
      </Section>

      <Section title="Revenue split">
        <p>Every paid request divides its revenue three ways, on-chain and in real time:</p>
        <DocsTable
          columns={[
            { header: "share", cell: (s: Split) => s.share, emphasis: true },
            { header: "to", cell: (s: Split) => s.label, emphasis: true },
            { header: "what it does", cell: (s: Split) => s.note, className: "font-sans" },
          ]}
          rows={SPLIT}
          rowKey={(s) => s.label}
        />
      </Section>

      <Section title="Buyback and burn">
        <p>
          The buyback budget is set aside from revenue today. Spending it purchases ORVX from the
          open market, and acquired tokens are periodically burned, permanently reducing supply.
          Both settle on Solana and carry a verifiable signature — the network&apos;s economics are
          designed to be auditable rather than asserted.
        </p>
        <p className="text-sm text-text-tertiary">
          The buyback and burn engine is merged and runs in stub mode: no ORVX is bought or burned
          on-chain yet, because the mint has not launched. See the{" "}
          <Link href={routes.roadmap} className="text-text-secondary hover:text-text-primary">
            roadmap
          </Link>{" "}
          for what is live today.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Stake ORVX <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.buy}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Buy ORVX
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
