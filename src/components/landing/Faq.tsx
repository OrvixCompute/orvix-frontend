import { Plus } from "lucide-react";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "What is Orvix?",
    a: "Decentralized AI compute network. An OpenAI-compatible API powered by community-run GPUs, settled in USDC on Solana.",
  },
  {
    q: "How is this different from OpenAI?",
    a: "There is no central provider. Requests are routed to independent GPU operators, metered on-chain, and billed in USDC — typically far cheaper than hosted incumbents.",
  },
  {
    q: "How do I get started?",
    a: "Connect a wallet, top up a USDC balance, create an API key, and point the OpenAI SDK at the Orvix base URL. Your existing code keeps working.",
  },
  {
    q: "How do providers earn?",
    a: "Operators connect a GPU, the orchestrator dispatches jobs to them, and they are paid in USDC per completed request — settled on-chain in real time.",
  },
  {
    q: "What is $ORVX used for?",
    a: "Staking for provider discount tiers and governance. Network revenue is used to buy back ORVX from the market and fund the treasury.",
  },
  {
    q: "When can I expect mainnet stability?",
    a: "The orchestrator is live and serving inference today. Coverage, models, and provider count grow as the network scales — track progress on the status page.",
  },
  {
    q: "Is the network audited?",
    a: "On-chain settlement and treasury flows are public and verifiable. Formal third-party audits are tracked publicly as they complete.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-border py-8">
      <h3 className="text-lg font-medium">FAQ</h3>
      <div className="mt-4 max-w-2xl">
        {FAQS.map((item) => (
          <details key={item.q} className="group border-b border-border py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-text-primary marker:content-['']">
              {item.q}
              <Plus
                size={14}
                className="text-text-muted transition-transform group-open:rotate-45"
              />
            </summary>
            <p className="mt-2 text-sm text-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
