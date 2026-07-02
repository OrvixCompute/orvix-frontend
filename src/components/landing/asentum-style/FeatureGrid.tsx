import { Badge, type BadgeTone } from "./Badge";
import { AssetImage } from "./primitives";

type Feature = {
  tone: BadgeTone;
  badge: string;
  body: string;
  image: { src: string; alt: string };
};

const FEATURES: Feature[] = [
  {
    tone: "green",
    badge: "OpenAI Compatible",
    body: "Drop in your existing OpenAI client. Just swap the base URL.",
    image: {
      src: "/openai-compatible.png",
      alt: "OpenAI-compatible API endpoint served by the Orvix network",
    },
  },
  {
    tone: "orange",
    badge: "USDC Settlement",
    body: "Every request metered on-chain. Predictable per-token pricing in stablecoin.",
    image: {
      src: "/usdc-settlement.png",
      alt: "USDC settlement for inference metered on-chain",
    },
  },
  {
    tone: "blue",
    badge: "Permissionless GPUs",
    body: "Anyone with a modern GPU can run a node and earn USDC routing inference.",
    image: {
      src: "/permissionless-gpus.png",
      alt: "Permissionless GPU nodes earning USDC on the Orvix network",
    },
  },
];

export function FeatureGrid() {
  return (
    <section className="px-[4%]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.badge}
            className={`flex flex-col pb-0 pt-12 md:px-8 ${
              i < FEATURES.length - 1 ? "md:dash-sep-r-desktop" : ""
            }`}
          >
            <Badge tone={f.tone}>{f.badge}</Badge>
            <p className="mt-2 text-[15px] leading-relaxed text-[#BABABA]">
              {f.body}
            </p>
            <AssetImage
              src={f.image.src}
              alt={f.image.alt}
              fit="contain"
              className="mt-8 h-40"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
