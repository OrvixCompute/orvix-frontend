import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { Mono } from "@/components/docs/DocsTable";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "ORVX utility roadmap — Orvix",
  description:
    "What ORVX unlocks on the Orvix network today, and what is planned. Each item is marked live, partly live, or coming soon.",
};

type Status = "live" | "partly-live" | "coming-soon";

const STATUS_LABEL: Record<Status, string> = {
  live: "live",
  "partly-live": "partly live",
  "coming-soon": "coming soon",
};

const STATUS_CLASS: Record<Status, string> = {
  live: "border-success/40 text-success",
  "partly-live": "border-warning/40 text-warning",
  "coming-soon": "border-border-strong text-text-tertiary",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5",
        "font-mono text-[11px] leading-5",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

interface Utility {
  title: string;
  status: Status;
  /** What works in production right now. Omitted when nothing does. */
  now?: React.ReactNode;
  /** What is designed but not built. */
  next?: React.ReactNode;
}

const UTILITIES: Utility[] = [
  {
    title: "Premium compute access",
    status: "partly-live",
    now: (
      <>
        Gold and diamond stakers already get priority node selection — their requests are routed to
        the least-loaded GPU first, ahead of the general queue.
      </>
    ),
    next: (
      <>
        Reserved GPU capacity held back for stakers, and early access to new hardware as it joins
        the network.
      </>
    ),
  },
  {
    title: "Compute credits",
    status: "coming-soon",
    next: (
      <>
        A recurring allowance earned by staking, spendable across chat, image generation, and the
        products below — so a stake converts into usage rather than sitting idle. Nothing is issued
        today, and the issuance rate has not been set.
      </>
    ),
  },
  {
    title: "Fee discounts",
    status: "partly-live",
    now: (
      <>
        Staking already discounts every request: 5% at silver, 15% at gold, 25% at diamond. The
        discount applies to the metered cost automatically — see{" "}
        <Link href={routes.staking} className="text-text-primary hover:text-accent-hover">
          staking
        </Link>{" "}
        for the thresholds.
      </>
    ),
    next: (
      <>
        Paying fees directly in ORVX. Billing is USDC-only today; ORVX changes what you pay only
        through the stake-based discount above.
      </>
    ),
  },
  {
    title: "AI agent marketplace",
    status: "coming-soon",
    next: (
      <>
        A catalog of ready-made agents and templates, with early access for stakers. Not built — no
        marketplace, agent runtime, or template registry exists yet.
      </>
    ),
  },
  {
    title: "Launch credits",
    status: "coming-soon",
    next: (
      <>
        Beta access and free compute hours for new AI projects building on Orvix, allocated to
        stakers first.
      </>
    ),
  },
  {
    title: "Node staking",
    status: "partly-live",
    now: (
      <>
        Staking itself is live end to end — stake, unstake, and a tier derived from the staked
        amount, all settled on Solana and visible in the dashboard.
      </>
    ),
    next: (
      <>
        A share of network revenue distributed to stakers. Today staking pays off through discounts,
        routing priority, and governance weight, not through a reward stream.
      </>
    ),
  },
  {
    title: "Governance",
    status: "live",
    now: (
      <>
        Voting runs on Snapshot, off-chain and gas-free, over fees, treasury spend, new
        integrations, and roadmap direction. The API exposes the space at{" "}
        <Mono>GET /v1/governance/snapshot-url</Mono>.
      </>
    ),
  },
  {
    title: "Revenue buyback",
    status: "live",
    now: (
      <>
        20% of every paid request funds market buybacks of ORVX, and acquired tokens are burned.
        Both settle on Solana and every event carries its signature, so the flow is auditable rather
        than asserted — the more compute the network sells, the larger the buyback.
      </>
    ),
  },
  {
    title: "Enterprise membership",
    status: "coming-soon",
    next: (
      <>
        Dedicated support, a management dashboard, and raised API ceilings for large stakers. Rate
        limits scale with tier today, but the rest of this does not exist.
      </>
    ),
  },
  {
    title: "ORVX ID",
    status: "coming-soon",
    next: (
      <>
        A developer identity whose reputation grows with stake and usage. No identity or reputation
        system is implemented.
      </>
    ),
  },
];

const LIVE_TIERS = [
  { tier: "bronze", stake: "0", discount: "0%", rpm: "60/min", routing: "any free node" },
  { tier: "silver", stake: "10,000", discount: "5%", rpm: "120/min", routing: "any free node" },
  { tier: "gold", stake: "50,000", discount: "15%", rpm: "300/min", routing: "least-loaded first" },
  {
    tier: "diamond",
    stake: "250,000",
    discount: "25%",
    rpm: "600/min",
    routing: "least-loaded first",
  },
];

const PROPOSED_TIERS = [
  { tier: "silver", benefit: "Fee discount" },
  { tier: "gold", benefit: "Larger discount, priority queue" },
  { tier: "platinum", benefit: "Dedicated compute" },
  { tier: "titanium", benefit: "Unlimited priority, enterprise features, beta products" },
];

export default function RoadmapPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="roadmap"
        title="What ORVX unlocks"
        lead="ORVX is meant to be a key to the network, not only an asset to hold. Some of that is working in production today; the rest is designed and not yet built. Every item below says which."
      />

      <Section title="How to read this">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge status="live" />
          <span className="text-sm">Working in production right now.</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge status="partly-live" />
          <span className="text-sm">Part of it works; the rest is planned.</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge status="coming-soon" />
          <span className="text-sm">Designed, not built. Nothing to use yet.</span>
        </div>
        <p className="pt-2 text-sm text-text-tertiary">
          Planned items are intentions, not commitments, and no timeline is attached to any of them.
          Anything already live is documented in the{" "}
          <Link href={routes.docs} className="text-text-secondary hover:text-text-primary">
            API reference
          </Link>
          .
        </p>
      </Section>

      <Section title="Utility">
        <ol className="space-y-8">
          {UTILITIES.map((u, i) => (
            <li key={u.title} className="flex gap-4">
              <span className="pt-0.5 font-mono text-sm text-text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-text-primary">{u.title}</p>
                  <StatusBadge status={u.status} />
                </div>
                {u.now && (
                  <p>
                    <span className="font-mono text-xs text-text-muted">today · </span>
                    {u.now}
                  </p>
                )}
                {u.next && (
                  <p>
                    <span className="font-mono text-xs text-text-muted">planned · </span>
                    {u.next}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Tiers in effect today" wide>
        <p className="max-w-2xl">
          Four tiers, derived from staked ORVX rather than wallet balance. These are the numbers the
          orchestrator actually applies to every request.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">tier</th>
                <th className="py-2 pr-6 text-left font-normal">staked ORVX</th>
                <th className="py-2 pr-6 text-left font-normal">discount</th>
                <th className="py-2 pr-6 text-left font-normal">rate limit</th>
                <th className="py-2 text-left font-normal">node selection</th>
              </tr>
            </thead>
            <tbody>
              {LIVE_TIERS.map((t) => (
                <tr key={t.tier} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{t.tier}</td>
                  <td className="py-2 pr-6">{t.stake}</td>
                  <td className="py-2 pr-6">{t.discount}</td>
                  <td className="py-2 pr-6">{t.rpm}</td>
                  <td className="py-2 font-sans">{t.routing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Membership, proposed">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-text-secondary">A reshaped tier ladder under consideration.</p>
          <StatusBadge status="coming-soon" />
        </div>
        <p>
          The idea is to widen what a tier buys — from a discount alone to dedicated capacity and
          access to features before they ship. It is a proposal: the tiers in force today are the
          four above, and none of the names or benefits below are in effect.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full max-w-xl font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">proposed tier</th>
                <th className="py-2 text-left font-normal">proposed benefit</th>
              </tr>
            </thead>
            <tbody>
              {PROPOSED_TIERS.map((t) => (
                <tr key={t.tier} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{t.tier}</td>
                  <td className="py-2 font-sans">{t.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-tertiary">
          Thresholds and discount percentages are not decided. Governance would set them.
        </p>
      </Section>

      <Section title="Next steps">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href={routes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Stake ORVX <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.tokenomics}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Tokenomics
          </Link>
          <Link
            href={routes.docs}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            What is live today
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
