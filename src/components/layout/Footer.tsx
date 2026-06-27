import Link from "next/link";

const mainLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Changelog", href: "/changelog" },
  { label: "Tokenomics", href: "/tokenomics" },
  { label: "Treasury", href: "/treasury" },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "Status", href: "/status" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

const externalLinks = [
  { label: "GitHub", href: "https://github.com/OrvixCompute/orvix" },
  { label: "Twitter", href: "https://twitter.com/orvix" },
  { label: "Discord", href: "https://discord.gg/orvix" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border pt-8">
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
        {mainLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">
        {externalLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            {l.label}
          </a>
        ))}
      </div>

      <p className="mt-6 text-xs text-text-muted">
        © 2026 Orvix. Decentralized AI compute network.
      </p>
    </footer>
  );
}
