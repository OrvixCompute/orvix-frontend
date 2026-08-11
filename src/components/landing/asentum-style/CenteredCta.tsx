import { Badge } from "./Badge";
import { CornerButton, CornerLink } from "./CornerButton";
import { DualHeading } from "./primitives";
import { CopyButton } from "@/components/ui/CopyButton";
import { config } from "@/lib/constants/config";
import { routes } from "@/lib/constants/routes";

export function CenteredCta() {
  return (
    <section className="px-[4%] py-32 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <Badge tone="green">Alpha live · Inference working</Badge>

        <DualHeading
          lead="The compute layer"
          emphasis="for the agentic web."
          className="mt-6 text-[32px] md:text-[44px]"
        />

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#BABABA] md:text-base">
          Permissionless GPUs, OpenAI-compatible endpoints, and USDC settlement on
          Solana — one network for the next generation of AI agents.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <CornerButton href={routes.playground}>Get Connected</CornerButton>
          <CornerLink href={routes.whitepaper}>Whitepaper →</CornerLink>
        </div>

        <div className="mt-12 flex items-center gap-3 border border-[#1F1F1F] bg-[#0A0A0A] px-4 py-2.5">
          <span className="font-dm-mono text-xs uppercase tracking-[0.12em] text-[#5A5A5A]">
            ORVX
          </span>
          <code className="font-dm-mono text-xs text-[#BABABA]">{config.orvxMint || "TBA"}</code>
          {config.orvxMint && <CopyButton value={config.orvxMint} />}
        </div>
      </div>
    </section>
  );
}
