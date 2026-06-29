import { Badge, type BadgeTone } from "./Badge";
import { CornerLink } from "./CornerButton";
import { AssetImage, ImagePlaceholder } from "./primitives";

export type AltSectionProps = {
  tone: BadgeTone;
  badge: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  // Optional brand artwork for the image slot; falls back to a gradient.
  image?: { src: string; alt: string };
  // When true, the image sits on the left and the text on the right (desktop).
  flip?: boolean;
};

export function AltSection({
  tone,
  badge,
  title,
  body,
  cta,
  image,
  flip = false,
}: AltSectionProps) {
  return (
    <section className="px-[4%] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className={flip ? "md:order-2" : ""}>
          <Badge tone={tone}>{badge}</Badge>
          <h2 className="font-plus mt-4 text-[24px] font-bold leading-[1.2] tracking-tight text-white md:text-[32px]">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#BABABA]">
            {body}
          </p>
          {cta && (
            <div className="mt-8">
              <CornerLink href={cta.href}>{cta.label}</CornerLink>
            </div>
          )}
        </div>
        <div className={flip ? "md:order-1" : ""}>
          {image ? (
            <AssetImage
              src={image.src}
              alt={image.alt}
              className="h-64 md:h-80"
            />
          ) : (
            <ImagePlaceholder className="h-64 md:h-80" />
          )}
        </div>
      </div>
    </section>
  );
}
