import type { Metadata } from "next";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Orvix",
  description: "How Orvix handles data when you use the network and dashboard.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="privacy"
        title="Privacy Policy"
        lead="Orvix is designed to collect as little as possible. This explains what is and isn't handled."
      />

      <Section title="What we process">
        <p>
          Authentication uses your Solana wallet signature — we never receive your private keys.
          Inference requests are routed and metered to bill usage; prompts and completions are
          processed to fulfill your request and are not sold.
        </p>
      </Section>

      <Section title="On-chain data">
        <p>
          Payments, staking, buybacks, and treasury flows are recorded on Solana. On-chain data is
          public and permanent by nature, and is outside Orvix&apos;s control once written.
        </p>
      </Section>

      <Section title="Local storage">
        <p>
          The dashboard stores your session token in your browser to keep you signed in. Clearing
          your browser storage or signing out removes it.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about privacy? Reach us at{" "}
          <a
            href="mailto:hello@orvix.xyz"
            className="text-text-primary underline underline-offset-4 hover:text-accent-hover"
          >
            hello@orvix.xyz
          </a>
          .
        </p>
      </Section>
    </PublicShell>
  );
}
