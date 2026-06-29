// Small shared building blocks for the Asentum-style landing page.
import Image from "next/image";

// Empty dashed-top spacer used between major sections (Asentum's divider rows).
export function SectionDivider() {
  return <section className="dash-border-t min-h-[70px] px-[4%]" />;
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
    <Tag
      className={`font-plus font-bold leading-[1.15] tracking-tight ${className}`}
    >
      <span className="text-[#ACACAC]">{lead} </span>
      <span className="text-white">{emphasis}</span>
    </Tag>
  );
}

// Placeholder gradient for image slots until real assets are dropped in.
// TODO(orvix): swap for real artwork when available.
export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] ${className}`}
    />
  );
}

// Framed brand artwork for image slots. Fills its sized parent with object-cover
// and adds a subtle hairline border to match the dark Asentum aesthetic.
export function AssetImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
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
        className="object-cover"
      />
    </div>
  );
}
