import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/asentum-style/Hero";
import { FeatureGrid } from "@/components/landing/asentum-style/FeatureGrid";
import { AltSection } from "@/components/landing/asentum-style/AltSection";
import { Roadmap } from "@/components/landing/asentum-style/Roadmap";
import { StatsRow } from "@/components/landing/asentum-style/StatsRow";
import { ComparisonTable } from "@/components/landing/asentum-style/ComparisonTable";
import { CenteredCta } from "@/components/landing/asentum-style/CenteredCta";
import { AsentumFooter } from "@/components/landing/asentum-style/AsentumFooter";
import { SectionDivider } from "@/components/landing/asentum-style/primitives";
import { routes } from "@/lib/constants/routes";

// Asentum-style landing page. Built from cloned Asentum structure with Orvix
// content. Old landing components remain under src/components/landing/* in case
// we revert; this page uses only the asentum-style/* set.

const BIG_STATS = [
  { value: "~2s", label: "First-token latency" },
  { value: "70%", label: "Provider revenue share" },
  { value: "30%", label: "Platform" },
  { value: "50%", label: "Platform to buyback" },
  { value: "1B", label: "ORVX supply" },
];

const SPEC_STATS = [
  { value: "Qwen-2.5-7B", label: "Models" },
  { value: "OpenAI v1", label: "Compatible" },
  { value: "USDC", label: "Settlement" },
  { value: "Solana", label: "Chain" },
  { value: "Apache 2.0", label: "License" },
];

export default function LandingPage() {
  return (
    <div className="asentum-page min-h-screen bg-black text-white">
      <Header />

      <main>
        <Hero />

        <SectionDivider />
        <FeatureGrid />

        <SectionDivider />
        <AltSection
          tone="blue"
          badge="Verifiable Inference"
          title="Inference you can trust without trusting the provider."
          body="Hashed model outputs. Stake-slashable providers. Every response is verifiable, so you don't have to take a node's word for it."
          image={{
            src: "/orvix-5.png",
            alt: "Orvix compute core with AI models, agents, enterprise, security, and global network capabilities",
          }}
        />
        <AltSection
          tone="green"
          badge="On-Chain Governance"
          title="ORVX holders steer the network."
          body="Vote on supported models, fee parameters, and treasury policy. Snapshot-based and stake-weighted."
          image={{
            src: "/orvix-6.png",
            alt: "Orvix holographic compute cube suspended in a data center",
          }}
          flip
        />

        <SectionDivider />
        <div id="roadmap" className="scroll-mt-24">
          <Roadmap />
        </div>

        <SectionDivider />
        <StatsRow stats={BIG_STATS} variant="big" />

        <SectionDivider />
        <AltSection
          tone="orange"
          badge="For Providers"
          title="Earn USDC running inference, today."
          body="Point your GPU at the orchestrator and start serving requests. Per-token payouts in USDC, settled on Solana — no lockups, no middlemen."
          cta={{ label: "Become a provider →", href: routes.providers }}
          image={{
            src: "/orvix-4.png",
            alt: "Orvix AI agent monitoring compute nodes and network status across the provider network",
          }}
        />
        <AltSection
          tone="blue"
          badge="For Developers"
          title="Use the network from any OpenAI client."
          body="Swap your base URL and keep your existing code. Streaming, tool calls, and the chat-completions surface you already know."
          cta={{ label: "Open the playground →", href: routes.playground }}
          image={{
            src: "/orvix-3.png",
            alt: "Orvix wordmark on a reflective data-grid surface",
          }}
          flip
        />

        <SectionDivider />
        <StatsRow stats={SPEC_STATS} variant="small" />

        <SectionDivider />
        <ComparisonTable />

        <SectionDivider />
        <CenteredCta />
      </main>

      <AsentumFooter />
    </div>
  );
}
