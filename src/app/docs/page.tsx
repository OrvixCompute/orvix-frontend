import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { CodeExample } from "@/components/landing/CodeExample";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { InlineNav } from "@/components/ui/InlineNav";
import { DocsTable, Mono, type DocsColumn } from "@/components/docs/DocsTable";
import { routes, dashboardRoutes } from "@/lib/constants/routes";
import { config } from "@/lib/constants/config";

export const metadata: Metadata = {
  title: "Documentation — Orvix",
  description:
    "Build on Orvix: an OpenAI-compatible chat and image API on a permissionless GPU network, billed in USDC on Solana. Endpoints, parameters, pricing, rate limits, and error codes.",
};

const base = `${config.apiUrl}/v1`;

const TOC = [
  { label: "quickstart", href: "#quickstart" },
  { label: "authentication", href: "#authentication" },
  { label: "chat", href: "#chat" },
  { label: "streaming", href: "#streaming" },
  { label: "tool calling", href: "#tools" },
  { label: "images", href: "#images" },
  { label: "models", href: "#models" },
  { label: "pricing", href: "#pricing" },
  { label: "rate limits", href: "#rate-limits" },
  { label: "quotas", href: "#quotas" },
  { label: "errors", href: "#errors" },
  { label: "endpoints", href: "#endpoints" },
] as const;

const STEPS = [
  {
    title: "Connect a wallet and top up",
    body: "Sign in with a Solana wallet and add a USDC balance. Requests are metered per token and billed against this balance.",
  },
  {
    title: "Create an API key",
    body: "Generate a key in the dashboard. Treat it like a password — it is shown once and authenticates every inference request.",
  },
  {
    title: "Point the OpenAI SDK at Orvix",
    body: "Swap the base URL and key. Your existing OpenAI code keeps working — no other changes required.",
  },
  {
    title: "Check which models are live",
    body: "GET /v1/models returns the catalog with an available flag per model. Only models a connected node is actually running can serve a request.",
  },
];

// --- Reference data (mirrors the orchestrator; see /v1/models for live state) ---

interface Param {
  name: string;
  type: string;
  default: string;
  notes: string;
}

const CHAT_PARAMS: Param[] = [
  {
    name: "model",
    type: "string",
    default: "—",
    notes: "Required. A chat model id from /v1/models.",
  },
  {
    name: "messages",
    type: "array",
    default: "—",
    notes: "Required, at least one. Roles: system, user, assistant, tool.",
  },
  { name: "max_tokens", type: "integer", default: "512", notes: "1–4096." },
  { name: "temperature", type: "number", default: "0.7", notes: "0–2." },
  {
    name: "stream",
    type: "boolean",
    default: "false",
    notes: "Server-sent events instead of one JSON body.",
  },
  {
    name: "tools",
    type: "array",
    default: "null",
    notes: "OpenAI function tools. Non-streaming only.",
  },
  {
    name: "tool_choice",
    type: "string | object",
    default: "null",
    notes: 'auto, none, required, or {"type":"function","function":{"name":…}}.',
  },
];

const IMAGE_PARAMS: Param[] = [
  {
    name: "model",
    type: "string",
    default: "orvix-image-1",
    notes: "An image model id from /v1/models.",
  },
  { name: "prompt", type: "string", default: "—", notes: "Required, non-empty." },
  { name: "n", type: "integer", default: "1", notes: "1–4 images per request." },
  {
    name: "size",
    type: "string",
    default: "1024x1024",
    notes:
      "256x256, 512x512, 1024x1024, 1024x1792, 1792x1024, 1536x1536 — capped by the model's max.",
  },
  { name: "response_format", type: "string", default: "url", notes: "url or b64_json." },
  {
    name: "user",
    type: "string",
    default: "null",
    notes: "Optional caller-side identifier, passed through.",
  },
];

const PARAM_COLUMNS: DocsColumn<Param>[] = [
  { header: "parameter", cell: (p) => p.name, emphasis: true },
  { header: "type", cell: (p) => p.type },
  { header: "default", cell: (p) => p.default },
  { header: "notes", cell: (p) => p.notes, className: "font-sans" },
];

interface ChatModel {
  id: string;
  context: string;
  input: string;
  output: string;
}

const CHAT_MODELS: ChatModel[] = [
  { id: "qwen-2.5-7b", context: "32,768", input: "$0.0001", output: "$0.0002" },
  { id: "mistral-7b", context: "32,768", input: "$0.0001", output: "$0.0002" },
  { id: "llama-3.1-8b-quantized", context: "8,192", input: "$0.00008", output: "$0.00016" },
];

const IMAGE_MODEL_ROWS = [
  { id: "orvix-image-1", max: "1024 × 1024", note: "Default model for /v1/images/generations." },
  {
    id: "flux-schnell",
    max: "1536 × 1536",
    note: "In the catalog; served only when a node loads it.",
  },
];

interface Tier {
  tier: string;
  stake: string;
  discount: string;
  rpm: string;
}

const TIERS: Tier[] = [
  { tier: "bronze", stake: "0", discount: "0%", rpm: "60" },
  { tier: "silver", stake: "10,000", discount: "5%", rpm: "120" },
  { tier: "gold", stake: "50,000", discount: "15%", rpm: "300" },
  { tier: "diamond", stake: "250,000", discount: "25%", rpm: "600" },
];

interface HeaderRow {
  name: string;
  on: string;
  meaning: string;
}

const RESPONSE_HEADERS: HeaderRow[] = [
  { name: "X-Orvix-Tier", on: "chat", meaning: "Stake-derived tier the request was priced at." },
  {
    name: "X-Orvix-Cost",
    on: "chat",
    meaning: "USDC charged. Absent on streamed responses — billing settles after the stream.",
  },
  { name: "X-Orvix-Node", on: "chat", meaning: "Id of the GPU node that served the job." },
  { name: "X-Orvix-Quota-Type", on: "chat", meaning: "holder, free, or paid." },
  {
    name: "X-Orvix-Quota-Remaining",
    on: "chat, images",
    meaning: "Free requests left. Omitted when the allowance is unlimited.",
  },
  {
    name: "X-Orvix-Quota-Reset",
    on: "images",
    meaning: "When the daily image allowance resets (00:00 UTC).",
  },
];

interface ErrorRow {
  status: string;
  code: string;
  meaning: string;
}

const ERRORS: ErrorRow[] = [
  { status: "400", code: "invalid_request", meaning: "Malformed body or an unsupported model id." },
  {
    status: "400",
    code: "invalid_size",
    meaning: "Image size the chosen model cannot produce. The message lists the sizes it accepts.",
  },
  {
    status: "400",
    code: "streaming_tools_unsupported",
    meaning: "tools sent together with stream: true. Retry with stream: false.",
  },
  {
    status: "401",
    code: "unauthorized",
    meaning:
      "Missing, revoked, or wrong-scheme credential — e.g. an API key sent to a JWT endpoint.",
  },
  {
    status: "402",
    code: "insufficient_balance",
    meaning: "Estimated cost exceeds the USDC balance. Top up in the dashboard.",
  },
  { status: "404", code: "not_found", meaning: "No such resource for this account." },
  {
    status: "422",
    code: "invalid_request",
    meaning: "Schema validation failed. details carries the field-level errors.",
  },
  {
    status: "429",
    code: "rate_limit_exceeded",
    meaning:
      "Per-minute ceiling for your tier. Body carries retry_after_seconds and limit_per_minute.",
  },
  {
    status: "503",
    code: "capacity_exhausted",
    meaning: "Nodes serve the model but all stayed busy. Retry after retry_after_seconds.",
  },
  {
    status: "503",
    code: "no_chat_provider",
    meaning:
      "No connected node serves that chat model. Retrying will not help — pick an available one.",
  },
  {
    status: "503",
    code: "no_image_provider",
    meaning: "No connected node serves that image model.",
  },
  {
    status: "500",
    code: "internal_error",
    meaning: "Unexpected server-side failure. Quote the request_id when reporting it.",
  },
];

interface Endpoint {
  group: string;
  method: string;
  path: string;
  auth: string;
  desc: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    group: "Inference",
    method: "POST",
    path: "/v1/chat/completions",
    auth: "API key",
    desc: "OpenAI-compatible chat completion, streaming optional",
  },
  {
    group: "Inference",
    method: "POST",
    path: "/v1/images/generations",
    auth: "API key",
    desc: "OpenAI-compatible image generation",
  },
  {
    group: "Inference",
    method: "GET",
    path: "/v1/models",
    auth: "none",
    desc: "Model catalog with a live available flag",
  },

  {
    group: "Account",
    method: "GET",
    path: "/v1/account/tier",
    auth: "JWT or key",
    desc: "Stake-derived tier, discount, and progress to the next tier",
  },
  {
    group: "Account",
    method: "GET",
    path: "/v1/account/quota",
    auth: "JWT or key",
    desc: "Chat and image quota status, plus images generated in the last 24h",
  },

  {
    group: "Auth",
    method: "GET",
    path: "/v1/auth/challenge",
    auth: "none",
    desc: "Challenge string to sign with a Solana wallet",
  },
  {
    group: "Auth",
    method: "POST",
    path: "/v1/auth/verify",
    auth: "none",
    desc: "Exchange a signed challenge for a JWT",
  },
  {
    group: "Auth",
    method: "POST",
    path: "/v1/auth/me",
    auth: "JWT",
    desc: "The currently authenticated account",
  },

  {
    group: "API keys",
    method: "POST",
    path: "/v1/api-keys",
    auth: "JWT",
    desc: "Create a key — the secret is returned once",
  },
  {
    group: "API keys",
    method: "GET",
    path: "/v1/api-keys",
    auth: "JWT",
    desc: "List keys (metadata only, never the secret)",
  },
  {
    group: "API keys",
    method: "DELETE",
    path: "/v1/api-keys/{key_id}",
    auth: "JWT",
    desc: "Revoke a key",
  },
  {
    group: "API keys",
    method: "POST",
    path: "/v1/api-keys/{key_id}/rotate",
    auth: "JWT",
    desc: "Issue a new secret for the same key record",
  },

  {
    group: "Billing",
    method: "POST",
    path: "/v1/billing/topup-intent",
    auth: "JWT",
    desc: "Create a USDC deposit address and memo",
  },
  {
    group: "Billing",
    method: "GET",
    path: "/v1/billing/balance",
    auth: "JWT",
    desc: "Current USDC balance",
  },
  {
    group: "Billing",
    method: "GET",
    path: "/v1/billing/transactions",
    auth: "JWT",
    desc: "Transaction history",
  },
  {
    group: "Billing",
    method: "GET",
    path: "/v1/billing/topup-intents",
    auth: "JWT",
    desc: "Pending top-up intents",
  },

  {
    group: "Staking",
    method: "POST",
    path: "/v1/staking/stake-intent",
    auth: "JWT",
    desc: "Memo'd intent for an ORVX stake deposit",
  },
  {
    group: "Staking",
    method: "POST",
    path: "/v1/staking/unstake",
    auth: "JWT",
    desc: "Unstake ORVX and queue a payout",
  },
  {
    group: "Staking",
    method: "GET",
    path: "/v1/staking/status",
    auth: "JWT",
    desc: "Stake, tier, and stake history",
  },
  {
    group: "Staking",
    method: "GET",
    path: "/v1/staking/buyback-history",
    auth: "none",
    desc: "Recent buybacks with their Solana signatures",
  },
  {
    group: "Staking",
    method: "GET",
    path: "/v1/staking/burn-history",
    auth: "none",
    desc: "Recent burns with their Solana signatures",
  },
  {
    group: "Staking",
    method: "GET",
    path: "/v1/staking/network-stats",
    auth: "none",
    desc: "Token-side dashboard feed: staked, burned, bought back",
  },

  {
    group: "Provider",
    method: "POST",
    path: "/v1/provider/register",
    auth: "JWT",
    desc: "Register as a provider — requires a 25,000 ORVX stake",
  },
  {
    group: "Provider",
    method: "POST",
    path: "/v1/provider/regenerate-secret",
    auth: "JWT",
    desc: "Rotate the node secret",
  },
  {
    group: "Provider",
    method: "GET",
    path: "/v1/provider/nodes",
    auth: "JWT",
    desc: "List your nodes",
  },
  {
    group: "Provider",
    method: "GET",
    path: "/v1/provider/nodes/{node_id}",
    auth: "JWT",
    desc: "Details for one node",
  },
  {
    group: "Provider",
    method: "POST",
    path: "/v1/provider/nodes/{node_id}/rename",
    auth: "JWT",
    desc: "Rename a node",
  },
  {
    group: "Provider",
    method: "DELETE",
    path: "/v1/provider/nodes/{node_id}",
    auth: "JWT",
    desc: "Remove a node",
  },
  {
    group: "Provider",
    method: "GET",
    path: "/v1/provider/earnings",
    auth: "JWT",
    desc: "Earnings summary",
  },
  {
    group: "Provider",
    method: "POST",
    path: "/v1/provider/withdraw",
    auth: "JWT",
    desc: "Request a payout of accumulated earnings",
  },
  {
    group: "Provider",
    method: "GET",
    path: "/v1/provider/withdrawals",
    auth: "JWT",
    desc: "Withdrawal history",
  },
  {
    group: "Provider",
    method: "GET",
    path: "/v1/provider/jobs",
    auth: "JWT",
    desc: "Jobs served by your nodes",
  },

  {
    group: "Network",
    method: "GET",
    path: "/v1/network/stats",
    auth: "none",
    desc: "Compute-side dashboard feed: nodes, GPUs, requests, tokens",
  },
  {
    group: "Network",
    method: "GET",
    path: "/v1/governance/snapshot-url",
    auth: "none",
    desc: "Snapshot space for off-chain voting",
  },
  { group: "Network", method: "GET", path: "/v1", auth: "none", desc: "API root and version" },
  { group: "Network", method: "GET", path: "/health", auth: "none", desc: "Liveness probe" },
];

const ENDPOINT_GROUPS = [
  "Inference",
  "Account",
  "Auth",
  "API keys",
  "Billing",
  "Staking",
  "Provider",
  "Network",
];

const ENDPOINT_COLUMNS: DocsColumn<Endpoint>[] = [
  { header: "method", cell: (e) => e.method, emphasis: true },
  { header: "path", cell: (e) => e.path, emphasis: true },
  { header: "auth", cell: (e) => e.auth },
  { header: "description", cell: (e) => e.desc, className: "font-sans" },
];

export default function DocsPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="documentation"
        title="Build on Orvix"
        lead="Orvix exposes an OpenAI-compatible chat and image API powered by a permissionless GPU network and settled in USDC on Solana. If you can call OpenAI, you can call Orvix."
      />

      <Section title="On this page">
        <InlineNav items={TOC} className="font-mono text-xs" />
      </Section>

      <Section id="quickstart" title="Quickstart">
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

      <Section id="authentication" title="Authentication">
        <p>
          Orvix uses two credentials, and they are not interchangeable. Inference runs on an{" "}
          <Mono>orvx_sk_</Mono> API key; everything that manages an account — keys, billing,
          staking, provider nodes — runs on a wallet-signed JWT. Sending an API key to a JWT
          endpoint returns <Mono>401</Mono>, because the key is not a token.
        </p>
        <p>
          The two read-only status endpoints <Mono>/v1/account/tier</Mono> and{" "}
          <Mono>/v1/account/quota</Mono> accept either, so a client can check its own tier and quota
          before dispatching work.
        </p>
        <CodeBlock
          language="bash"
          code={`# Inference — API key
Authorization: Bearer orvx_sk_...

# Account management — wallet-signed JWT
Authorization: Bearer eyJ...`}
        />
        <p className="pt-2">
          A JWT is obtained by signing a challenge with the wallet that owns the account. The
          challenge is valid for five minutes and single-use.
        </p>
        <CodeBlock
          language="bash"
          code={`# 1. Request a challenge
curl "${config.apiUrl}/v1/auth/challenge?wallet=YOUR_WALLET_ADDRESS"

# 2. Sign it with the wallet, then exchange it for a JWT
curl -X POST ${base}/auth/verify \\
  -H "Content-Type: application/json" \\
  -d '{"wallet": "YOUR_WALLET_ADDRESS", "signature": "BASE58_SIGNATURE"}'

# => { "access_token": "eyJ...", "token_type": "bearer" }`}
        />
      </Section>

      <Section id="chat" title="Chat completions">
        <p>
          <Mono>POST /v1/chat/completions</Mono> is the OpenAI chat endpoint. The base URL is the
          only thing that changes versus OpenAI.
        </p>
        <CodeBlock language="bash" code={`Base URL:  ${base}`} />
        <div className="pt-2">
          <CodeExample />
        </div>
      </Section>

      <Section id="chat-params" title="Request parameters" wide>
        <DocsTable columns={PARAM_COLUMNS} rows={CHAT_PARAMS} rowKey={(p) => p.name} />
        <p className="pt-2 text-sm">
          Every response is produced by a real GPU node. If no node can take the job the request
          fails rather than returning a placeholder — see{" "}
          <Link href="#errors" className="text-text-primary hover:text-accent-hover">
            errors
          </Link>{" "}
          for the two distinct 503s. A chat request waits up to three seconds for a free slot before
          giving up, and a node has 60 seconds to finish the job.
        </p>
      </Section>

      <Section id="chat-headers" title="Response headers" wide>
        <DocsTable
          columns={[
            { header: "header", cell: (h: HeaderRow) => h.name, emphasis: true },
            { header: "on", cell: (h: HeaderRow) => h.on },
            { header: "meaning", cell: (h: HeaderRow) => h.meaning, className: "font-sans" },
          ]}
          rows={RESPONSE_HEADERS}
          rowKey={(h) => h.name}
        />
      </Section>

      <Section id="streaming" title="Streaming">
        <p>
          Set <Mono>stream: true</Mono> to receive server-sent events in the OpenAI chunk format,
          terminated by <Mono>data: [DONE]</Mono>. Billing settles once the stream finishes, so{" "}
          <Mono>X-Orvix-Cost</Mono> is not present on a streamed response.
        </p>
        <CodeBlock
          language="python"
          code={`stream = client.chat.completions.create(
    model="qwen-2.5-7b",
    messages=[{"role": "user", "content": "Explain Solana in one paragraph"}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`}
        />
      </Section>

      <Section id="tools" title="Tool calling">
        <p>
          Pass OpenAI-shaped <Mono>tools</Mono> (and optionally <Mono>tool_choice</Mono>). When the
          model calls one, the reply carries <Mono>finish_reason: &quot;tool_calls&quot;</Mono> and{" "}
          <Mono>message.tool_calls</Mono>, with <Mono>message.content</Mono> null. Send the result
          back as a <Mono>role: &quot;tool&quot;</Mono> message carrying the matching{" "}
          <Mono>tool_call_id</Mono>.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST ${base}/chat/completions \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-2.5-7b",
    "messages": [{"role": "user", "content": "What is the weather in Jakarta?"}],
    "tools": [{"type": "function", "function": {
      "name": "get_weather",
      "description": "Current weather for a city",
      "parameters": {"type": "object",
                     "properties": {"city": {"type": "string"}},
                     "required": ["city"]}
    }}]
  }'`}
        />
        <p>
          Tools cannot be combined with streaming yet — that returns{" "}
          <Mono>400 streaming_tools_unsupported</Mono> rather than silently dropping the calls.
        </p>
      </Section>

      <Section id="images" title="Image generation">
        <p>
          <Mono>POST /v1/images/generations</Mono> follows the OpenAI images shape and authenticates
          with the same API key.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST ${base}/images/generations \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "orvix-image-1",
    "prompt": "a fox in snow",
    "size": "1024x1024",
    "n": 1
  }'

# => { "created": ..., "data": [{ "url": "${config.apiUrl}/images/<id>.png" }] }`}
        />
        <div className="pt-2">
          <DocsTable columns={PARAM_COLUMNS} rows={IMAGE_PARAMS} rowKey={(p) => p.name} />
        </div>
        <p className="pt-2">
          Generated images are deleted 24 hours after creation — download anything worth keeping. A
          size larger than the model&apos;s maximum is rejected with <Mono>400 invalid_size</Mono>,
          and the error message lists the sizes that model does accept.
        </p>
      </Section>

      <Section id="models" title="Models" wide>
        <p className="max-w-2xl">
          <Mono>GET /v1/models</Mono> is public and returns the catalog in the OpenAI shape, plus an
          Orvix-specific <Mono>available</Mono> flag: <Mono>true</Mono> when a currently connected
          node runs that model. Check it before dispatching — a catalog-only model returns{" "}
          <Mono>503</Mono>. Extra fields are ignored by OpenAI clients.
        </p>
        <CodeBlock language="bash" code={`curl ${base}/models`} />
        <p className="pt-4 font-mono text-xs text-text-muted">chat models</p>
        <DocsTable
          columns={[
            { header: "model", cell: (m: ChatModel) => m.id, emphasis: true },
            { header: "context", cell: (m: ChatModel) => m.context },
            { header: "input / 1K", cell: (m: ChatModel) => m.input },
            { header: "output / 1K", cell: (m: ChatModel) => m.output },
          ]}
          rows={CHAT_MODELS}
          rowKey={(m) => m.id}
        />
        <p className="pt-4 font-mono text-xs text-text-muted">image models</p>
        <DocsTable
          columns={[
            {
              header: "model",
              cell: (m: (typeof IMAGE_MODEL_ROWS)[number]) => m.id,
              emphasis: true,
            },
            { header: "max size", cell: (m: (typeof IMAGE_MODEL_ROWS)[number]) => m.max },
            {
              header: "notes",
              cell: (m: (typeof IMAGE_MODEL_ROWS)[number]) => m.note,
              className: "font-sans",
            },
          ]}
          rows={IMAGE_MODEL_ROWS}
          rowKey={(m) => m.id}
        />
      </Section>

      <Section id="pricing" title="Pricing and billing" wide>
        <p className="max-w-2xl">
          Chat is metered per token at the rates above and settled in USDC against your balance.
          Images are priced per 1024 × 1024 equivalent and scale with pixel count. Costs are
          deducted after the job completes, and the exact amount comes back in{" "}
          <Mono>X-Orvix-Cost</Mono>.
        </p>
        <p className="max-w-2xl">
          Staking ORVX derives your tier, which sets both the discount applied to every request and
          your per-minute throughput. Tier is computed from staked ORVX, not wallet balance.
        </p>
        <DocsTable
          columns={[
            { header: "tier", cell: (t: Tier) => t.tier, emphasis: true },
            { header: "staked ORVX", cell: (t: Tier) => t.stake },
            { header: "discount", cell: (t: Tier) => t.discount },
            { header: "requests / min", cell: (t: Tier) => t.rpm },
          ]}
          rows={TIERS}
          rowKey={(t) => t.tier}
        />
        <p className="max-w-2xl pt-2 text-sm">
          Call <Mono>GET /v1/account/tier</Mono> for your current tier, discount, and how much more
          stake the next one needs. A request whose estimated cost exceeds your balance is refused
          with <Mono>402 insufficient_balance</Mono> before any GPU time is spent.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
          <Link
            href={routes.staking}
            className="text-text-primary transition-colors hover:text-accent-hover"
          >
            Staking details
          </Link>
          <Link
            href="/pricing"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Pricing page
          </Link>
        </div>
      </Section>

      <Section id="rate-limits" title="Rate limits">
        <p>
          Limits are per API key, per minute, and counted separately for chat and images — a burst
          of images does not spend your chat allowance. The ceiling is the one shown for your tier
          above. Exceeding it returns <Mono>429</Mono> with everything needed to back off.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded: max 60 chat requests per minute on the bronze tier",
    "retry_after_seconds": 42,
    "tier": "bronze",
    "bucket": "chat",
    "limit_per_minute": 60,
    "upgrade_url": "https://orvix.network/pricing"
  }
}`}
        />
      </Section>

      <Section id="quotas" title="Quotas">
        <p>
          Alongside billing, each account has a free allowance. Non-holders get a lifetime pool of
          free chat requests; holding ORVX above the threshold lifts the chat cap entirely. Images
          run on a daily allowance that resets at 00:00 UTC. The exact numbers are operator
          configuration and change over time, so read them rather than hard-coding them.
        </p>
        <CodeBlock
          language="bash"
          code={`curl ${base}/account/quota \\
  -H "Authorization: Bearer orvx_sk_..."

# => {
#   "is_holder": false,
#   "orvx_balance": "0",
#   "chat":  { "type": "free_tier", "lifetime_free_used": 12, "lifetime_free_limit": 1000 },
#   "image": { "type": "grace_daily", "used_today": 3, "daily_limit": 50,
#              "generated_images_last_24h": [] }
# }`}
        />
        <p>
          Every chat response also carries <Mono>X-Orvix-Quota-Type</Mono> and, when the allowance
          is finite, <Mono>X-Orvix-Quota-Remaining</Mono> — enough to track usage without a second
          request.
        </p>
      </Section>

      <Section id="errors" title="Errors" wide>
        <p className="max-w-2xl">
          Every error uses the same envelope. <Mono>code</Mono> is stable and safe to branch on;{" "}
          <Mono>message</Mono> is for humans. <Mono>request_id</Mono> identifies the request in the
          orchestrator logs — quote it when reporting a problem. Some codes add fields, such as{" "}
          <Mono>retry_after_seconds</Mono>.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "code": "capacity_exhausted",
    "message": "All compute providers serving this model are busy. Retry shortly.",
    "request_id": "b0f1…",
    "retry_after_seconds": 3
  }
}`}
        />
        <div className="pt-2">
          <DocsTable
            columns={[
              { header: "status", cell: (e: ErrorRow) => e.status, emphasis: true },
              { header: "code", cell: (e: ErrorRow) => e.code, emphasis: true },
              { header: "meaning", cell: (e: ErrorRow) => e.meaning, className: "font-sans" },
            ]}
            rows={ERRORS}
            rowKey={(e, i) => `${e.code}-${i}`}
          />
        </div>
      </Section>

      <Section id="endpoints" title="Endpoint reference" wide>
        <p className="max-w-2xl">
          Everything the public API exposes, grouped by area. Paths are relative to{" "}
          <Mono>{config.apiUrl}</Mono>. Operator-only admin endpoints exist behind a separate header
          and are not part of this surface.
        </p>
        <div className="space-y-6 pt-2">
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group} className="space-y-2">
              <p className="font-mono text-xs text-text-muted">{group.toLowerCase()}</p>
              <DocsTable
                columns={ENDPOINT_COLUMNS}
                rows={ENDPOINTS.filter((e) => e.group === group)}
                rowKey={(e) => `${e.method} ${e.path}`}
              />
            </div>
          ))}
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
          <Link
            href={routes.stats}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Live network stats
          </Link>
        </div>
      </Section>
    </PublicShell>
  );
}
