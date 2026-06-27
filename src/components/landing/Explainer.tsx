import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/constants/routes";

interface Block {
  title: string;
  body: string;
  cta: { label: string; href: string };
}

const BLOCKS: Block[] = [
  {
    title: "For developers",
    body: "Point the OpenAI SDK at Orvix and keep your code. You get an OpenAI-compatible API, transparent per-request pricing in USDC, and no rate-limit games — pay only for the tokens you use.",
    cta: { label: "Read the docs", href: routes.docs },
  },
  {
    title: "For providers",
    body: "Connect a GPU and start earning USDC for completed jobs. The orchestrator handles routing, metering, and settlement; payouts land on-chain in real time with no platform middleman.",
    cta: { label: "Become a provider", href: routes.providers },
  },
  {
    title: "For ORVX holders",
    body: "Stake ORVX to unlock provider discount tiers and govern the network. A share of every request's revenue is used to buy back ORVX from the open market and fund the treasury.",
    cta: { label: "View tokenomics", href: "/tokenomics" },
  },
];

export function Explainer() {
  return (
    <section>
      {BLOCKS.map((block) => (
        <div key={block.title} className="border-t border-border py-8">
          <h3 className="text-lg font-medium">{block.title}</h3>
          <p className="mt-2 max-w-2xl text-text-secondary">{block.body}</p>
          <Link
            href={block.cta.href}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-text-primary transition-colors hover:text-accent-hover"
          >
            {block.cta.label} <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </section>
  );
}
