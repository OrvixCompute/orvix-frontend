import type { Metadata } from "next";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Terms of Service — Orvix",
  description: "The terms that govern your use of the Orvix network and dashboard.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="terms"
        title="Terms of Service"
        lead="By accessing the Orvix network, API, or dashboard, you agree to these terms."
      />

      <Section title="Use of the service">
        <p>
          Orvix provides access to a decentralized inference network. You are responsible for the
          security of your wallet and API keys, and for all activity that occurs under them. Do not
          use the service for unlawful purposes or in violation of third-party rights.
        </p>
      </Section>

      <Section title="Payments">
        <p>
          Usage is metered and billed in USDC against your balance. On-chain transactions are final
          and irreversible. Pricing and discount tiers may change as the network evolves.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The service is provided &quot;as is&quot;, without warranties of any kind. The network is
          operated by independent providers; availability and performance may vary. To the maximum
          extent permitted by law, Orvix is not liable for indirect or consequential damages.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          These terms may be updated over time. Continued use of the service after a change
          constitutes acceptance of the revised terms.
        </p>
      </Section>
    </PublicShell>
  );
}
