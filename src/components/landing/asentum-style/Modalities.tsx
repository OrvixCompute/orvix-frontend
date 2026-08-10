import { Badge } from "./Badge";
import { DualHeading } from "./primitives";
import { VIDEO_PREVIEW } from "@/lib/constants/models";

type Modality = {
  name: string;
  body: string;
  status: string;
  live: boolean;
};

/**
 * What the network can actually run.
 *
 * Video carries the same "Coming soon" wording as the playground tab and says
 * why in the same breath. It is listed because the engine is real work worth
 * showing — not because it can be called. Nothing here links to a request path
 * for it, and it is not in the model catalog.
 */
const MODALITIES: Modality[] = [
  {
    name: "Chat",
    body: "OpenAI-compatible completions, streaming and tool calls included.",
    status: "Live",
    live: true,
  },
  {
    name: "Image",
    body: "DALL·E-compatible generation, priced per megapixel.",
    status: "Live",
    live: true,
  },
  {
    name: VIDEO_PREVIEW.label,
    body: "Text prompt in, a short clip out. The engine is written; the network to serve it is not connected yet.",
    status: VIDEO_PREVIEW.status,
    live: false,
  },
];

export function Modalities() {
  return (
    <section className="px-[4%] py-12">
      <div className="mx-auto max-w-7xl">
        <DualHeading
          lead="What you can run"
          emphasis="on the network."
          className="mb-10 text-[24px] md:text-[32px]"
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {MODALITIES.map((m) => (
            <div key={m.name} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-plus text-[18px] font-semibold text-white">{m.name}</span>
                <Badge tone={m.live ? "green" : "neutral"}>{m.status}</Badge>
              </div>
              <p className="text-[15px] leading-relaxed text-[#BABABA]">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
