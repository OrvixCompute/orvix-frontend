import { Badge } from "./Badge";
import { CornerButton, CornerLink } from "./CornerButton";
import { DualHeading } from "./primitives";
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
      </div>
    </section>
  );
}
