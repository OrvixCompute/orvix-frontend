import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { CodeExample } from "@/components/landing/CodeExample";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { routes, dashboardRoutes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Documentation — Orvix",
  description:
    "Build on Orvix: an OpenAI-compatible inference API on a permissionless GPU network, billed in USDC on Solana.",
};

const STEPS = [
  {
    title: "Connect a wallet and top up",
    body: "Sign in with a Solana wallet and add a USDC balance. Requests are metered per token and billed against this balance.",
  },
  {
    title: "Create an API key",
    body: "Generate a key in the dashboard. Treat it like a password — it is shown once and authenticates every request.",
  },
  {
    title: "Point the OpenAI SDK at Orvix",
    body: "Swap the base URL and key. Your existing OpenAI code keeps working — no other changes required.",
  },
];

const ENDPOINTS = [
  { method: "POST", path: "/v1/chat/completions", desc: "OpenAI-compatible chat inference (streaming supported)" },
  { method: "GET", path: "/v1/billing/balance", desc: "Current USDC balance and tier" },
  { method: "POST", path: "/v1/billing/topup-intent", desc: "Create a USDC deposit address and memo" },
  { method: "GET", path: "/v1/api-keys", desc: "List your API keys" },
  { method: "GET", path: "/v1/staking/status", desc: "Stake, tier, and discount status" },
];

export default function DocsPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="documentation"
        title="Build on Orvix"
        lead="Orvix exposes an OpenAI-compatible inference API powered by a permissionless GPU network and settled in USDC on Solana. If you can call OpenAI, you can call Orvix."
      />

      <Section title="Quickstart">
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-mono text-sm text-text-muted">0{i + 1}</span>
              <div>
                <p className="text-text-primary">{step.title}</p>
                <p className="mt-1 text-text-secondary">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={dashboardRoutes.apiKeys}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Create an API key <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.playground}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Open the playground
          </Link>
        </div>
      </Section>

      <Section title="Authentication">
        <p>
          Every request is authenticated with a bearer token — your API key. Send it in the
          <span className="font-mono text-text-primary"> Authorization </span> header.
        </p>
        <CodeBlock language="bash" code={`Authorization: Bearer orvx_sk_...`} />
      </Section>

      <Section title="Make a request">
        <p>The base URL is the only thing that changes versus OpenAI.</p>
        <CodeBlock language="bash" code={`Base URL:  https://api.orvix.xyz/v1`} />
        <div className="pt-2">
          <CodeExample />
        </div>
      </Section>

      <Section title="Endpoints">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-6 text-left font-normal">method</th>
                <th className="py-2 pr-6 text-left font-normal">path</th>
                <th className="py-2 text-left font-normal">description</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.path} className="border-t border-border text-text-secondary">
                  <td className="py-2 pr-6 text-text-primary">{e.method}</td>
                  <td className="py-2 pr-6 text-text-primary">{e.path}</td>
                  <td className="py-2">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Next steps">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href={routes.providers}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Run a provider node <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.whitepaper}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Read the whitepaper
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
