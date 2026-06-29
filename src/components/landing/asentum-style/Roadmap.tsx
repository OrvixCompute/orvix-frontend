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
        note: "/v1/chat/completions working.",
        status: "SHIPPED",
      },
      {
        title: "Staking + tier system",
        note: "Bronze / Silver / Gold / Diamond.",
        status: "SHIPPED",
      },
      {
        title: "Buyback + burn",
        note: "Engine merged, flags off.",
        status: "SHIPPED",
      },
    ],
  },
  {
    tone: "yellow",
    badge: "Phase 2 · Public Beta",
    items: [
      {
        title: "Custom domain + HTTPS",
        note: "Production endpoint hardening.",
        status: "PLANNED",
      },
      {
        title: "Provider onboarding CLI",
        note: "One command to join the network.",
        status: "PLANNED",
      },
      {
        title: "Multi-provider routing",
        note: "Load-balanced inference across nodes.",
        status: "PLANNED",
      },
      {
        title: "Real payout flow activation",
        note: "USDC settlement to providers.",
        status: "IN PROGRESS",
      },
    ],
  },
];

function PhaseColumn({ phase, withSep }: { phase: Phase; withSep: boolean }) {
  return (
    <div className={`pt-12 md:px-10 ${withSep ? "md:dash-sep-r-desktop" : ""}`}>
      <Badge tone={phase.tone}>{phase.badge}</Badge>
      <ul className="mt-8 space-y-6">
        {phase.items.map((item) => (
          <li key={item.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium text-white">
                {item.title}
              </span>
              <Badge tone={STATUS_TONE[item.status]} className="shrink-0">
                {item.status}
              </Badge>
            </div>
            <span className="text-[13px] leading-relaxed text-[#7D7D7D]">
              {item.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Roadmap() {
  return (
    <section className="px-[4%] py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
        {PHASES.map((phase, i) => (
          <PhaseColumn
            key={phase.badge}
            phase={phase}
            withSep={i < PHASES.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
