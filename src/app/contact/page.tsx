import type { Metadata } from "next";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Contact — Orvix",
  description: "Get in touch with the Orvix team and community.",
};

const CHANNELS = [
  { label: "Email", value: "hello@orvix.xyz", href: "mailto:hello@orvix.xyz" },
  { label: "GitHub", value: "OrvixCompute/orvix", href: "https://github.com/OrvixCompute/orvix" },
  { label: "Twitter", value: "@orvix", href: "https://twitter.com/orvix" },
  { label: "Discord", value: "discord.gg/orvix", href: "https://discord.gg/orvix" },
];

export default function ContactPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="contact"
        title="Get in touch"
        lead="Questions, partnerships, or provider onboarding — reach the team and community here."
      />
      <Section title="Channels">
        <ul className="space-y-3">
          {CHANNELS.map((c) => (
            <li key={c.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-text-muted">{c.label}</span>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                className="font-mono text-sm text-text-primary underline underline-offset-4 transition-colors hover:text-accent-hover"
              >
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </PublicShell>
  );
}
