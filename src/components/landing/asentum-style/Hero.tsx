import { CornerButton, CornerLink } from "./CornerButton";
import { DualHeading } from "./primitives";
import { routes } from "@/lib/constants/routes";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[4%] pb-20 pt-20">
      {/* Background video */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src="/orvix-hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      {/* Dark overlay for legibility */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Top badge — dev talk / latest entry */}
        <a
          href="/changelog"
          className="font-dm-mono mb-8 inline-block text-[13px] font-medium tracking-[0.15em] text-[#7D7D7D] transition-colors hover:text-white"
        >
          ‣ Dev talk: Latest entry
        </a>

        <DualHeading
          as="h1"
          lead="Decentralized AI compute,"
          emphasis="settled in USDC."
          className="max-w-4xl text-[28px] md:text-[48px]"
        />

        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#BABABA] md:text-base">
          OpenAI-compatible API on a permissionless GPU network. Pay per token in
          USDC. Earn ORVX by routing requests, by providing GPUs, or by holding
          through buyback and burn.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <CornerButton href={routes.playground}>Try the Playground</CornerButton>
          <CornerLink href={routes.whitepaper}>Whitepaper →</CornerLink>
        </div>
      </div>
    </section>
  );
}
