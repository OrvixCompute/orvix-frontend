// Small shared building blocks for the Asentum-style landing page.
import Image from "next/image";

// Empty spacer with a hairline top, used between major sections.
export function SectionDivider() {
  return <section className="min-h-10 border-t border-[#1F1F1F] px-[4%] md:min-h-[70px]" />;
}

// Dual-color display heading: gray lead-in + white emphasis (Asentum's headline
// pattern). Uses Plus Jakarta Sans via .font-plus.
export function DualHeading({
  lead,
  emphasis,
  as: Tag = "h2",
  className = "",
}: {
  lead: string;
  emphasis: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag className={`font-plus font-bold leading-[1.15] tracking-tight ${className}`}>
      <span className="text-[#ACACAC]">{lead} </span>
      <span className="text-white">{emphasis}</span>
    </Tag>
  );
}

// Framed brand artwork for image slots. Fills its sized parent and adds a subtle
// hairline border to match the dark Asentum aesthetic. `fit` controls how the
// image sits in the frame: "cover" crops to fill, "contain" preserves the whole
// composition (safest when an asset's aspect ratio differs from the slot).
export function AssetImage({
  src,
  alt,
  className = "",
  fit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-white/10 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
