import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/layout/PublicShell";
import { Faq } from "@/components/landing/Faq";

export const metadata: Metadata = {
  title: "FAQ — Orvix",
  description: "Frequently asked questions about Orvix — the decentralized AI compute network.",
};

export default function FaqPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="faq"
        title="Frequently asked questions"
        lead="The short version of how Orvix works, for developers, providers, and ORVX holders."
      />
      <Faq />
    </PublicShell>
  );
}
