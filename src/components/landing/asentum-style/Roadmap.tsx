import { Badge, type BadgeTone } from "./Badge";

type Status = "SHIPPED" | "IN PROGRESS" | "PLANNED";

type Item = { title: string; note: string; status: Status };

type Phase = {
  tone: BadgeTone;
  badge: string;
  items: Item[];
};

const STATUS_TONE: Record<Status, BadgeTone> = {
  SHIPPED: "green",
  "IN PROGRESS": "yellow",
  PLANNED: "neutral",
};

const PHASES: Phase[] = [
  {
    tone: "green",
    badge: "Phase 1 · Alpha",
    items: [
      {
        title: "Orchestrator live",
        note: "Backend serving real inference.",
        status: "SHIPPED",
      },
      {
        title: "OpenAI-compatible API",
        note: "/v1/chat/completions and /v1/images/generations serving traffic.",
        status: "SHIPPED",
      },
      {
        title: "Image generation",
        note: "flux-schnell + orvix-image-1 running on live nodes.",
        status: "SHIPPED",
      },
      {
        title: "Video generation",
        note: "orvix-video-1 serving clips through POST /v1/videos/generations.",
        status: "SHIPPED",
      },
      {
        title: "Tier system",
        note: "Bronze to Diamond: fee discount, rate limit, node priority.",
        status: "SHIPPED",
      },
    ],
  },
  {
    tone: "green",
    badge: "Phase 2 · Public Beta",
    items: [
      {
        title: "Custom domain + HTTPS",
        note: "orvix.network serving /v1 over TLS.",
        status: "SHIPPED",
      },
      {
        title: "Provider node client",
        note: "orvix-node published on PyPI — install, join, start.",
        status: "SHIPPED",
      },
      {
        title: "Multi-provider routing",
        note: "Least-loaded node selection, priority tiers first.",
        status: "SHIPPED",
      },
      {
        title: "USDC settlement",
        note: "Top-ups credited automatically; provider withdrawals paid on-chain.",
        status: "SHIPPED",
      },
    ],
  },
  {
    tone: "blue",
    badge: "Phase 3 · Token economy",
    items: [
      {
        title: "ORVX mint launch",
        note: "The gate on the rest of this phase — stake deposits cannot be credited without it.",
        status: "PLANNED",
      },
      {
        title: "Staking live",
        note: "Deposits credit, tiers above bronze become reachable.",
        status: "PLANNED",
      },
      {
        title: "Buyback + burn activation",
        note: "Engine already merged and running in stub mode; flips to real on-chain swaps and burns.",
        status: "PLANNED",
      },
      {
        title: "Compute credits",
        note: "Staking earns a recurring allowance spendable on inference.",
        status: "PLANNED",
      },
      {
        title: "Staker revenue share",
        note: "A cut of network revenue paid out to stakers.",
        status: "PLANNED",
      },
    ],
  },
];

function PhaseColumn({ phase }: { phase: Phase }) {
  return (
    <div className="pt-12 md:px-6 lg:px-8">
      <Badge tone={phase.tone}>{phase.badge}</Badge>
      <ul className="mt-8 space-y-6">
        {phase.items.map((item) => (
          <li key={item.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium text-white">{item.title}</span>
              <Badge tone={STATUS_TONE[item.status]} className="shrink-0">
                {item.status}
              </Badge>
            </div>
            <span className="text-[13px] leading-relaxed text-[#7D7D7D]">{item.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Roadmap() {
  return (
    <section className="px-[4%] py-12">
      {/* Three phases stay two-up at md — three columns there leaves each item's
          title and status badge fighting for ~150px — and go three-up at lg. */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((phase) => (
          <PhaseColumn key={phase.badge} phase={phase} />
        ))}
      </div>
    </section>
  );
}
