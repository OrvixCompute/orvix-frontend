import Link from "next/link";
import { routes } from "@/lib/constants/routes";

// Asentum-style 3-column footer + bottom bar, wired to existing Orvix routes.
// Links to routes that don't exist yet are marked with TODO.

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Research.",
    links: [
      { label: "Whitepaper", href: routes.whitepaper },
      { label: "Tokenomics", href: "/tokenomics" },
      { label: "Roadmap", href: "/#roadmap" },
      { label: "Documentation", href: routes.docs },
    ],
  },
  {
    title: "Network.",
    links: [
      { label: "Playground", href: routes.playground },
      { label: "API Reference", href: routes.docs }, // TODO(orvix): dedicated API ref route
      { label: "Providers", href: routes.providers },
      { label: "Staking", href: routes.staking },
      { label: "ORVX Token", href: routes.buy },
      {
        label: "GitHub",
        href: "https://github.com/OrvixCompute/orvix",
        external: true,
      },
    ],
  },
  {
    title: "Connect.",
    links: [
      { label: "Twitter (X)", href: "https://twitter.com/orvix", external: true },
      // TODO(orvix): confirm real Telegram handle
      { label: "Telegram", href: "https://t.me/orvix", external: true },
      {
        label: "GitHub",
        href: "https://github.com/OrvixCompute/orvix",
        external: true,
      },
    ],
  },
];

// TODO(orvix): no /disclosures route yet — points at /terms for now.
const BOTTOM_LINKS: FooterLink[] = [
  { label: "Disclosures", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const className =
    "text-[14px] text-[#7D7D7D] transition-colors hover:text-white";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function AsentumFooter() {
  return (
    <footer className="dash-border-t bg-[#0A0A0A]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-[4%] py-16 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <span className="font-plus text-[15px] font-semibold text-white">
              {col.title}
            </span>
            <div className="flex flex-col gap-3">
              {col.links.map((link) => (
                <FooterAnchor key={link.label + link.href} link={link} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="dash-border-t bg-[#080808]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-[4%] py-6 md:flex-row md:items-center">
          <span className="font-dm-mono text-xs uppercase tracking-[0.12em] text-[#5A5A5A]">
            © 2026 Orvix
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {BOTTOM_LINKS.map((link) => (
              <FooterAnchor key={link.label} link={link} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
