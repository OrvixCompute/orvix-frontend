// Asentum-style accent badge: DM Mono uppercase label on a tinted background.
// Color pairs extracted from the live Asentum CSS.

export type BadgeTone = "green" | "orange" | "blue" | "yellow" | "neutral";

const TONES: Record<BadgeTone, { color: string; bg: string }> = {
  green: { color: "#26CC6B", bg: "#0A1D12" },
  orange: { color: "#F29751", bg: "#231409" },
  blue: { color: "#2DAEFF", bg: "#081720" },
  yellow: { color: "#F3BA2F", bg: "#1F1806" },
  neutral: { color: "#737373", bg: "#1C1C1C" },
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  const { color, bg } = TONES[tone];
  return (
    <span
      className={`font-dm-mono inline-block px-4 py-2 text-xs font-medium tracking-[0.15em] ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}
