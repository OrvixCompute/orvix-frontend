import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, ExternalLink, Package } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DocsTable, Mono } from "@/components/docs/DocsTable";
import { routes, dashboardRoutes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Providers — Orvix",
  description:
    "Earn USDC with your idle GPU. Install the orvix-node agent from PyPI, register your machine, and get paid a share of every job you serve.",
};

const GITHUB_REPO = "https://github.com/OrvixCompute/orvix";
const GITHUB_ISSUES = "https://github.com/OrvixCompute/orvix/issues";
const PYPI_PACKAGE = "https://pypi.org/project/orvix-node/";
const NODE_README = "https://github.com/OrvixCompute/orvix/blob/main/orvix-node/README.md";
const INSTALL_SCRIPT =
  "https://raw.githubusercontent.com/OrvixCompute/orvix/main/orvix-node/install.sh";

const STEPS = [
  {
    title: "Install the node agent",
    body: "orvix-node is published on PyPI. The one-line installer sets up a virtualenv and a systemd service; pip works too if you'd rather wire it up yourself.",
  },
  {
    title: "Register as a provider",
    body: "POST /v1/provider/register from your dashboard session returns a provider_id and a node_secret. Those two are what the agent authenticates with.",
  },
  {
    title: "Point the agent at the orchestrator",
    body: "orvix-node join takes the credentials, or write them to ~/.orvix/config.yaml. CLI flags beat ORVIX_NODE_* env vars, which beat the config file.",
  },
  {
    title: "Start serving",
    body: "orvix-node start opens a WebSocket to the orchestrator, registers your GPU, and begins accepting chat and image jobs.",
  },
  {
    title: "Get paid in USDC",
    body: "You earn a share of every completed request. Withdraw from the dashboard — payouts settle on Solana and every one is verifiable on-chain.",
  },
];

interface Command {
  cmd: string;
  desc: string;
}

const COMMANDS: Command[] = [
  { cmd: "orvix-node join", desc: "Save the provider credentials from the dashboard" },
  { cmd: "orvix-node start", desc: "Connect to the orchestrator and start taking jobs" },
  { cmd: "orvix-node status", desc: "Health, uptime, current jobs, and connection state" },
  { cmd: "orvix-node gpu", desc: "What the GPU detector sees — add --watch to follow it live" },
  { cmd: "orvix-node test-inference", desc: "Run a prompt locally, without the orchestrator" },
  { cmd: "orvix-node config show", desc: "Resolved config with secrets masked" },
  { cmd: "orvix-node logs --follow", desc: "Tail the agent log" },
];

const REQUIREMENTS = [
  "NVIDIA GPU with CUDA 11+ and 8 GB or more of VRAM, on Linux, for real inference",
  "Python 3.11 or newer",
  "A stable connection — the agent holds an outbound WebSocket, so no inbound port or public IP is needed",
  "A Solana wallet to register with and to receive USDC payouts",
  "Comfort leaving a long-lived service running (the installer can set up systemd for you)",
];

export default function ProvidersPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="providers"
        title="Earn USDC with your idle GPU"
        lead="Orvix turns spare GPU capacity into income — connect a machine, serve inference, and get paid in USDC for every completed job. The node agent is published on PyPI, so onboarding is self-serve."
      />

      <section className="pb-8">
        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Install the node agent</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              The one-line installer is the shortest path on Linux: it creates a virtualenv,
              installs <Mono>orvix-node</Mono>, and can register a systemd unit so the agent comes
              back after a reboot.
            </p>
          </div>
          <CodeBlock
            language="bash"
            code={`curl -sSL ${INSTALL_SCRIPT} | bash
orvix-node join
orvix-node start`}
          />
          <p className="max-w-2xl text-sm text-text-secondary">
            Prefer to do it by hand? <Mono>pip install orvix-node</Mono> installs the core agent
            with a mock backend, <Mono>&quot;orvix-node[gpu]&quot;</Mono> adds vLLM for real
            inference, and <Mono>&quot;orvix-node[image]&quot;</Mono> adds the diffusers stack for
            image generation.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={PYPI_PACKAGE} target="_blank" rel="noreferrer">
              <span className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
                <Package size={14} /> orvix-node on PyPI
              </span>
            </a>
            <a href={NODE_README} target="_blank" rel="noreferrer">
              <span className="inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary">
                Node documentation <ExternalLink size={14} />
              </span>
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
              <span className="inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary">
                <Github size={14} /> Read the source
              </span>
            </a>
          </div>
        </Card>
      </section>

      <Section title="How it works">
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
            href={dashboardRoutes.staking}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Open the dashboard <ArrowRight size={14} />
          </Link>
          <Link
            href={routes.docs}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Provider API reference
          </Link>
        </div>
      </Section>

      <Section title="Configuration">
        <p>
          Required settings are <Mono>provider_id</Mono> and <Mono>node_secret</Mono>, both returned
          by <Mono>POST /v1/provider/register</Mono>. Resolution order is CLI flags, then{" "}
          <Mono>ORVIX_NODE_*</Mono> environment variables, then the config file, then defaults.
        </p>
        <CodeBlock
          language="bash"
          code={`orvix-node config init    # writes ~/.orvix/config.yaml
orvix-node config show    # resolved config, secrets masked`}
        />
        <p>
          Inference is mocked by default, so the whole pipeline runs on a machine with no GPU at all
          — useful for checking the connection before committing hardware. Set{" "}
          <Mono>backend: &quot;vllm&quot;</Mono> to serve real traffic. The agent also exposes a
          local health server on port 9000 with <Mono>/health</Mono> and <Mono>/metrics</Mono>.
        </p>
      </Section>

      <Section title="Commands" wide>
        <DocsTable
          columns={[
            { header: "command", cell: (c: Command) => c.cmd, emphasis: true },
            { header: "what it does", cell: (c: Command) => c.desc, className: "font-sans" },
          ]}
          rows={COMMANDS}
          rowKey={(c) => c.cmd}
        />
      </Section>

      <Section title="Economics">
        <p>
          Providers earn <span className="text-text-primary">70% of revenue</span> on every request
          they serve. Payouts are in USDC and settle on-chain — you can verify each payment on
          Solana. Staking ORVX raises your tier, which improves routing priority.
        </p>
        <p>
          The whitepaper sets a 25,000 ORVX minimum stake to register as a provider. That gate is
          switched off for the alpha, so you can register and start serving without staking anything
          — expect it to be enforced once staking goes live.
        </p>
      </Section>

      <Section title="Requirements">
        <ul className="space-y-2">
          {REQUIREMENTS.map((req) => (
            <li key={req} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm">
          <a
            href={PYPI_PACKAGE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Install orvix-node <ArrowRight size={14} />
          </a>
          <Link
            href={routes.staking}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Learn about staking tiers
          </Link>
          <a
            href={GITHUB_ISSUES}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Report an issue
          </a>
        </div>
      </Section>
    </PublicShell>
  );
}
