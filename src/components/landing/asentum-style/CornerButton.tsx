import Link from "next/link";

// Asentum-style "corner-pop" CTA: a bordered hit-area with four corner marks
// that scale up on hover (animation defined in globals.css).

const CORNERS = [
  { pos: "top-0 left-0 origin-top-left", sides: ["top", "left"] },
  { pos: "top-0 right-0 origin-top-right", sides: ["top", "right"] },
  { pos: "bottom-0 left-0 origin-bottom-left", sides: ["bottom", "left"] },
  { pos: "bottom-0 right-0 origin-bottom-right", sides: ["bottom", "right"] },
] as const;

const MARK = "#3A3A3A";

function CornerMarks() {
  return (
    <>
      {CORNERS.map(({ pos, sides }) => {
        const style: React.CSSProperties = { width: 12, height: 12 };
        for (const side of sides) {
          const cap = side.charAt(0).toUpperCase() + side.slice(1);
          // e.g. borderTopWidth / borderTopColor / borderTopStyle
          (style as Record<string, string | number>)[`border${cap}Width`] = 1;
          (style as Record<string, string | number>)[`border${cap}Color`] = MARK;
          (style as Record<string, string | number>)[`border${cap}Style`] = "solid";
        }
        return (
          <span
            key={pos}
            className={`corner-mark absolute ${pos}`}
            style={style}
          />
        );
      })}
    </>
  );
}

export function CornerButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  const inner = (
    <div className="corner-pop-hover relative flex h-12 cursor-pointer items-center justify-center px-8">
      <CornerMarks />
      <span className="font-dm-mono text-[13px] font-medium uppercase tracking-[0.15em] text-[#BABABA]">
        {children}
      </span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return <Link href={href}>{inner}</Link>;
}

// The thin underlined "Whitepaper →" secondary link beside a CornerButton.
export function CornerLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const className =
    "font-dm-mono text-[13px] font-medium uppercase tracking-[0.15em] text-[#777777] underline transition-colors hover:text-white";
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
