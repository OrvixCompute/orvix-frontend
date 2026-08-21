import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell, PageIntro, Section } from "@/components/layout/PublicShell";
import { CodeExample } from "@/components/landing/CodeExample";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { InlineNav } from "@/components/ui/InlineNav";
import { DocsTable, Mono, type DocsColumn } from "@/components/docs/DocsTable";
import { routes } from "@/lib/constants/routes";
import { config } from "@/lib/constants/config";

export const metadata: Metadata = {
  title: "Documentation — Orvix",
  description:
    "Build on Orvix: an OpenAI-compatible chat, image, video and embeddings API on a permissionless GPU network, plus Solana token intelligence. Billed in USDC on Solana. Quickstart, endpoints, limits, pricing, and error codes.",
};

const base = `${config.apiUrl}/v1`;

const TOC = [
  { label: "quickstart", href: "#quickstart" },
  { label: "authentication", href: "#authentication" },
  { label: "chat", href: "#chat" },
  { label: "images", href: "#images" },
  { label: "videos", href: "#videos" },
  { label: "embeddings", href: "#embeddings" },
  { label: "token intel", href: "#token-intel" },
  { label: "models", href: "#models" },
  { label: "free tier", href: "#free-tier" },
  { label: "pricing", href: "#pricing" },
  { label: "rate limits", href: "#rate-limits" },
  { label: "errors", href: "#errors" },
  { label: "billing", href: "#billing" },
  { label: "providers", href: "#providers" },
  { label: "endpoints", href: "#endpoints" },
] as const;

// --- Reference data (verified against the orchestrator on main) ---

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
    notes: "Must fit the model's maximum — see the image model table below.",
  },
  { name: "response_format", type: "string", default: "url", notes: "url or b64_json." },
  {
    name: "user",
    type: "string",
    default: "null",
    notes: "Optional caller-side identifier, passed through.",
  },
];

const VIDEO_PARAMS: Param[] = [
  {
    name: "model",
    type: "string",
    default: "orvix-video-1",
    notes: "The only video model in the catalog today.",
  },
  { name: "prompt", type: "string", default: "—", notes: "Required, non-empty." },
  { name: "width", type: "integer", default: "704", notes: "256–1280." },
  { name: "height", type: "integer", default: "480", notes: "256–720." },
  { name: "num_frames", type: "integer", default: "97", notes: "9–257." },
  { name: "fps", type: "integer", default: "24", notes: "8–60." },
  {
    name: "num_inference_steps",
    type: "integer",
    default: "30",
    notes: "1–60. More steps, slower render.",
  },
  { name: "guidance_scale", type: "number", default: "3.0", notes: "0–20." },
  {
    name: "negative_prompt",
    type: "string",
    default: "null",
    notes: "What the clip should avoid.",
  },
  { name: "seed", type: "integer", default: "null", notes: "Set for reproducible clips." },
];

const EMBEDDING_PARAMS: Param[] = [
  {
    name: "model",
    type: "string",
    default: "orvix-embed-1",
    notes: "The only embedding model in the catalog today.",
  },
  {
    name: "input",
    type: "string | array",
    default: "—",
    notes: "Required. One string or up to 256 strings.",
  },
  {
    name: "encoding_format",
    type: "string",
    default: "float",
    notes: "float or base64.",
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
  { id: "flux-schnell", max: "1536 × 1536", note: "Larger canvas, same endpoint." },
];

const VIDEO_MODEL_ROWS = [
  {
    id: "orvix-video-1",
    max: "1280 × 720",
    note: "Default (and only) model for /v1/videos/generations. LTX-Video.",
  },
];

const EMBEDDING_MODEL_ROWS = [
  {
    id: "orvix-embed-1",
    dims: "768",
    note: "Default (and only) model for /v1/embeddings. BGE base, L2-normalized.",
  },
];

interface Tier {
  tier: string;
  stake: string;
  discount: string;
  rpm: string;
  routing: string;
}

const TIERS: Tier[] = [
  { tier: "bronze", stake: "0", discount: "0%", rpm: "60", routing: "any free node" },
  { tier: "silver", stake: "10,000", discount: "5%", rpm: "120", routing: "any free node" },
  { tier: "gold", stake: "50,000", discount: "15%", rpm: "300", routing: "least-loaded first" },
  { tier: "diamond", stake: "250,000", discount: "25%", rpm: "600", routing: "least-loaded first" },
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
  {
    name: "X-Orvix-Quota-Type",
    on: "chat",
    meaning: "free while the lifetime allowance lasts, paid once it is spent.",
  },
  {
    name: "X-Orvix-Quota-Remaining",
    on: "chat, images, videos",
    meaning: "Requests left in the current allowance.",
  },
  {
    name: "X-Orvix-Quota-Reset",
    on: "images, videos",
    meaning: "When the daily image/video allowance resets (00:00 UTC).",
  },
];

interface ErrorRow {
  status: string;
  code: string;
  meaning: string;
}

const ERRORS: ErrorRow[] = [
  {
    status: "503",
    code: "capacity_exhausted",
    meaning:
      "Nodes serve the model but all were busy. Retry — the body carries retry_after_seconds.",
  },
  {
    status: "503",
    code: "no_chat_provider",
    meaning:
      "No node serves that chat model. Retrying will not help — pick one with available:true.",
  },
  {
    status: "503",
    code: "no_image_provider",
    meaning: "No node serves that image model. Same as above: switch models rather than retry.",
  },
  {
    status: "503",
    code: "no_video_provider",
    meaning: "No node serves the video model. Retrying will not help — check /v1/models.",
  },
  {
    status: "503",
    code: "no_embedding_provider",
    meaning: "No node serves the embedding model. Same as above: do not retry.",
  },
  {
    status: "504",
    code: "node_timeout",
    meaning: "The node did not finish in time — video renders can exceed the job timeout.",
  },
  {
    status: "429",
    code: "rate_limit_exceeded",
    meaning:
      "Per-minute ceiling for your tier. Body carries tier, bucket, limit_per_minute, retry_after_seconds, upgrade_url.",
  },
  {
    status: "402",
    code: "insufficient_balance",
    meaning: "Free allowance spent and the estimated cost exceeds your USDC balance. Top up.",
  },
  {
    status: "401",
    code: "invalid_api_key",
    meaning: "Malformed, revoked, or unknown API key.",
  },
  {
    status: "401",
    code: "unauthorized",
    meaning: "Missing credential, or an API key sent to a JWT-only endpoint.",
  },
  {
    status: "400",
    code: "invalid_size",
    meaning:
      "Image size larger than the model's maximum. The message lists the sizes that model accepts.",
  },
  {
    status: "400",
    code: "streaming_tools_unsupported",
    meaning: "tools sent together with stream: true. Retry with stream: false.",
  },
  {
    status: "400",
    code: "invalid_request",
    meaning: "Malformed body or an unsupported model id.",
  },
  {
    status: "422",
    code: "invalid_request",
    meaning: "Schema validation failed. details carries the field-level errors.",
  },
  {
    status: "404",
    code: "not_found",
    meaning: "No such resource for this account.",
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
    method: "POST",
    path: "/v1/videos/generations",
    auth: "API key",
    desc: "Text-to-video generation — synchronous, one clip per call",
  },
  {
    group: "Inference",
    method: "POST",
    path: "/v1/embeddings",
    auth: "API key",
    desc: "OpenAI-compatible text embeddings, 768-dim, L2-normalized",
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
    desc: "Chat, image, and video allowance status, plus images generated in the last 24h",
  },

  {
    group: "Auth",
    method: "GET",
    path: "/v1/auth/challenge",
    auth: "none",
    desc: "Message and nonce for the wallet to sign",
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
    desc: "Create a key — the secret is returned once, 10 active maximum",
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
    desc: "Treasury address, memo, and solana: QR payload for a USDC deposit",
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
    desc: "Register as a provider and receive a node secret",
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
    desc: "Request a payout — minimum 1 USDC, 5 requests per day",
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
    desc: "Nodes online, GPU breakdown, request and token volume, model availability",
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

  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}",
    auth: "JWT",
    desc: "Token profile: metadata, supply, price, liquidity, risk warnings",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/accumulation",
    auth: "JWT",
    desc: "Accumulation score 0–100 with component metrics",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/holders",
    auth: "JWT",
    desc: "Top holders resolved to wallets with balance and supply share",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/early-buyers",
    auth: "JWT",
    desc: "First-buy evidence for top holders with tx signatures",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/social",
    auth: "JWT",
    desc: "DexScreener + Twitter social analysis with sentiment",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/clusters",
    auth: "JWT",
    desc: "Coordinated wallet cluster detection with confidence scores",
  },
  {
    group: "Token Intel",
    method: "GET",
    path: "/v1/tokens/{ca}/intelligence",
    auth: "JWT",
    desc: "AI-generated narrative, risk flags, and watch signals from GPU node",
  },
];

const ENDPOINT_GROUPS = [
  "Inference",
  "Token Intel",
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
        lead="Orvix exposes an OpenAI-compatible chat, image, video, and embeddings API powered by a permissionless GPU network and settled in USDC on Solana. The Token Intel API adds Solana token intelligence — accumulation, holders, social, clusters, and AI analysis. If you can call OpenAI, you can call Orvix."
      />

      <Section title="On this page">
        <InlineNav items={TOC} className="font-mono text-xs" />
      </Section>

      <Section id="quickstart" title="Quickstart">
        <p>
          Three steps: get a key, make a chat call, make an image call. The first 1000 chat requests,
          50 images a day, and a daily video allowance cost nothing, so you can get all the way
          through this without funding anything.
        </p>
        <p className="pt-1 text-text-primary">1. Create an API key</p>
        <p>
          Sign in with a Solana wallet and create a key in the dashboard. It is shown once — store
          it like a password.
        </p>
        <p className="pt-1 text-text-primary">2. First chat call</p>
        <CodeBlock
          language="bash"
          code={`curl ${base}/chat/completions \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-2.5-7b",
    "messages": [{"role": "user", "content": "Hello, Orvix!"}]
  }'`}
        />
        <p className="pt-1 text-text-primary">3. First image call</p>
        <CodeBlock
          language="bash"
          code={`curl ${base}/images/generations \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "orvix-image-1",
    "prompt": "a fox in snow",
    "size": "1024x1024"
  }'`}
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={routes.playground}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Try it in the playground <ArrowRight size={14} />
          </Link>
          <Link
            href={`${routes.playground}?mode=intel`}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Token Intel playground
          </Link>
          <Link
            href="#endpoints"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Full endpoint reference
          </Link>
        </div>
      </Section>

      <Section id="authentication" title="Authentication">
        <p>
          Orvix uses two credentials and they are not interchangeable. Inference runs on an{" "}
          <Mono>orvx_sk_</Mono> API key; account actions — keys, billing, staking, provider nodes —
          run on a wallet-signed JWT. Sending an API key to a JWT-only endpoint returns{" "}
          <Mono>401</Mono>, because the key is not a token.
        </p>
        <p>
          Two endpoints accept either scheme: <Mono>GET /v1/account/tier</Mono> and{" "}
          <Mono>GET /v1/account/quota</Mono>, so a client can check its own tier and allowance
          before dispatching work.
        </p>

        <p className="pt-2 text-text-primary">API keys</p>
        <p>
          Created with <Mono>POST /v1/api-keys</Mono> using a JWT. The secret is returned exactly
          once and never again — rotate the key if you lose it. You may hold up to <Mono>10</Mono>{" "}
          active keys, and each can be revoked or rotated independently. An API key cannot create
          other API keys; that path is JWT-only by design.
        </p>
        <CodeBlock language="bash" code={`Authorization: Bearer orvx_sk_...`} />

        <p className="pt-2 text-text-primary">Wallet-signed JWT</p>
        <p>
          Request a challenge, sign the returned <Mono>message</Mono> with the wallet, and exchange
          it for a token. Challenges last five minutes and are single-use. They survive an
          orchestrator restart, and a wallet may hold several outstanding at once — asking for a new
          challenge does not invalidate one the user is still signing.
        </p>
        <CodeBlock
          language="bash"
          code={`# 1. Request a challenge
curl "${base}/auth/challenge?wallet=YOUR_WALLET_ADDRESS"

# => { "message": "Sign this message to authenticate with Orvix: <nonce>",
#      "nonce": "...", "expires_at": "2026-08-09T12:05:00Z" }

# 2. Sign that exact message, then verify
curl -X POST ${base}/auth/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "wallet": "YOUR_WALLET_ADDRESS",
    "message": "Sign this message to authenticate with Orvix: <nonce>",
    "signature": "BASE58_SIGNATURE"
  }'

# => { "token": "eyJ...",
#      "user": { "id": "...", "wallet": "...", "tier": "bronze",
#                "balance_usdc": "0" } }`}
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

      <Section id="chat-params" title="Chat parameters" wide>
        <DocsTable columns={PARAM_COLUMNS} rows={CHAT_PARAMS} rowKey={(p) => p.name} />
        <p className="max-w-2xl pt-2 text-sm">
          Every response is produced by a real GPU node. If no node can take the job the request
          fails rather than returning a placeholder — see{" "}
          <Link href="#errors" className="text-text-primary hover:text-accent-hover">
            errors
          </Link>{" "}
          for the two 503s and how they differ.
        </p>
      </Section>

      <Section id="streaming" title="Streaming and tool calling">
        <p>
          Set <Mono>stream: true</Mono> for server-sent events in the OpenAI chunk format,
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
        <p>
          Tool calling works on the non-streaming path. Pass OpenAI-shaped <Mono>tools</Mono> (and
          optionally <Mono>tool_choice</Mono>); when the model calls one, the reply carries{" "}
          <Mono>finish_reason: &quot;tool_calls&quot;</Mono> and <Mono>message.tool_calls</Mono>,
          with <Mono>message.content</Mono> null. Send the result back as a{" "}
          <Mono>role: &quot;tool&quot;</Mono> message carrying the matching{" "}
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
          Tools cannot be combined with streaming. That returns{" "}
          <Mono>400 streaming_tools_unsupported</Mono> rather than silently dropping the calls.
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

      <Section id="images" title="Image generation" wide>
        <p className="max-w-2xl">
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
        <p className="max-w-2xl pt-2">
          A size larger than the model&apos;s maximum is rejected with <Mono>400 invalid_size</Mono>
          , and the message lists the sizes that model does accept. Generated images are deleted 24
          hours after creation — download anything worth keeping.
        </p>
      </Section>

      <Section id="videos" title="Video generation" wide>
        <p className="max-w-2xl">
          <Mono>POST /v1/videos/generations</Mono> turns a text prompt into a short clip. It is
          synchronous: the request stays open while the node renders, then returns the clip URL.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST ${base}/videos/generations \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "orvix-video-1",
    "prompt": "a cat walking through a neon city",
    "width": 704,
    "height": 480,
    "num_frames": 97,
    "fps": 24
  }'

# => { "created": ..., "data": [{ "url": "${config.apiUrl}/videos/<id>.mp4" }] }`}
        />
        <div className="pt-2">
          <DocsTable columns={PARAM_COLUMNS} rows={VIDEO_PARAMS} rowKey={(p) => p.name} />
        </div>
        <p className="max-w-2xl pt-2">
          A clip takes minutes of GPU on the node, so the endpoint serializes per node — expect a
          slow response. The returned video is deleted 24 hours after creation, so download anything
          worth keeping. Video is free during the alpha, limited by a daily per-account allowance
          shown by <Mono>GET /v1/account/quota</Mono>.
        </p>
      </Section>

      <Section id="embeddings" title="Embeddings" wide>
        <p className="max-w-2xl">
          <Mono>POST /v1/embeddings</Mono> is the OpenAI embeddings endpoint: text in, vectors out.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST ${base}/embeddings \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "orvix-embed-1",
    "input": ["A document to index", "Another one"]
  }'

# => { "object": "list", "model": "orvix-embed-1",
#      "data": [{ "object": "embedding", "index": 0, "embedding": [0.01, "..."] }],
#      "usage": { "prompt_tokens": 8, "total_tokens": 8 } }`}
        />
        <div className="pt-2">
          <DocsTable columns={PARAM_COLUMNS} rows={EMBEDDING_PARAMS} rowKey={(p) => p.name} />
        </div>
        <p className="max-w-2xl pt-2">
          Up to <Mono>256</Mono> inputs of <Mono>8192</Mono> characters each. Vectors come back in
          input order and are <Mono>L2-normalized</Mono>, so cosine similarity is a dot product.
          Embeddings are free during the alpha, rate-limited per API key in their own bucket so an
          indexing run cannot spend your chat allowance.
        </p>
      </Section>

      <Section id="token-intel" title="Token intelligence">
        <p>
          The Token Intel API lets you analyze any Solana token by its contract address (CA). Paste a
          mint address and get a full intelligence report: metadata, price, liquidity, holder
          distribution, accumulation signals, social metrics, coordinated wallet clusters, and an
          AI-generated narrative.
        </p>
        <p>
          All endpoints are JWT-authenticated and rate-limited. Fire them in parallel — each is
          independent and returns its own data, so partial failures do not block the rest.
        </p>
        <CodeBlock
          language="bash"
          code={`# Token profile
curl "${base}/tokens/So11111111111111111111111111111111111111112" \\
  -H "Authorization: Bearer <JWT>"

# => {
#   "mint": "So11111111111111111111111111111111111111112",
#   "metadata": { "name": "Wrapped SOL", "symbol": "SOL", "uri": null },
#   "supply": { "amount": "...", "decimals": 9, "ui_amount_string": "..." },
#   "price_usdc": 148.52,
#   "liquidity": { "estimated_usdc": 12500000, "pool_count": 42 },
#   "holders": { "total_holders": 850000, "top_holders": [...], "top10_share": 0.35 },
#   "risk": { "warnings": [] },
#   "scanned_at": "2026-08-21T12:00:00Z"
# }`}
        />
        <p className="pt-2 text-text-primary">Endpoints</p>
        <p>
          All seven endpoints take a mint address as the path parameter <Mono>{`{ca}`}</Mono> and
          return independent data:
        </p>
        <div className="space-y-1.5 font-mono text-xs">
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}</Mono>{" "}
            <span className="font-sans text-text-secondary">— token profile (metadata, supply, price, liquidity, risk)</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/accumulation</Mono>{" "}
            <span className="font-sans text-text-secondary">— accumulation score 0–100 with component metrics</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/holders</Mono>{" "}
            <span className="font-sans text-text-secondary">— top holders resolved to wallets</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/early-buyers</Mono>{" "}
            <span className="font-sans text-text-secondary">— first-buy evidence for top holders</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/social</Mono>{" "}
            <span className="font-sans text-text-secondary">— DexScreener + Twitter social analysis</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/clusters</Mono>{" "}
            <span className="font-sans text-text-secondary">— coordinated wallet cluster detection</span>
          </p>
          <p>
            <Mono>GET /v1/tokens/{`{ca}`}/intelligence</Mono>{" "}
            <span className="font-sans text-text-secondary">— AI narrative from GPU node</span>
          </p>
        </div>
        <p className="pt-2 text-text-primary">Accumulation score</p>
        <p>
          The accumulation endpoint returns a composite score from 0 to 100 with a label:{" "}
          <Mono>distribution</Mono> (0–39), <Mono>weak</Mono> (40–59), <Mono>moderate</Mono> (60–79),
          or <Mono>strong</Mono> (80–100). Component scores for distribution, inflow, and activity
          are included in <Mono>metrics</Mono>.
        </p>
        <p className="pt-2 text-text-primary">Cluster detection</p>
        <p>
          The clusters endpoint identifies wallets that move together — shared funding sources,
          coordinated buy timing, or overlapping holdings. Each cluster carries a confidence score
          (0–1) and the signals that triggered it. A confidence above 0.6 warrants attention.
        </p>
        <p className="pt-2 text-text-primary">AI intelligence</p>
        <p>
          The intelligence endpoint runs the token data through a GPU-hosted model and returns a
          narrative analysis, risk flags, and a <Mono>watch_next</Mono> summary. This is the slowest
          endpoint — expect a few seconds of latency while the node processes.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
          <Link
            href={`${routes.playground}?mode=intel`}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Try it in the playground <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      <Section id="models" title="Models" wide>
        <p className="max-w-2xl">
          <Mono>GET /v1/models</Mono> is public and returns the catalog in the OpenAI shape, plus an
          Orvix-specific <Mono>available</Mono> boolean: <Mono>true</Mono> only when a connected GPU
          node actually runs that model. Check it before dispatching. The catalog lists models that
          may have no node behind them right now, and asking for one of those returns a{" "}
          <Mono>503</Mono> that no amount of retrying will fix. Extra fields are ignored by OpenAI
          clients.
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
        <p className="pt-4 font-mono text-xs text-text-muted">video models</p>
        <DocsTable
          columns={[
            {
              header: "model",
              cell: (m: (typeof VIDEO_MODEL_ROWS)[number]) => m.id,
              emphasis: true,
            },
            { header: "max size", cell: (m: (typeof VIDEO_MODEL_ROWS)[number]) => m.max },
            {
              header: "notes",
              cell: (m: (typeof VIDEO_MODEL_ROWS)[number]) => m.note,
              className: "font-sans",
            },
          ]}
          rows={VIDEO_MODEL_ROWS}
          rowKey={(m) => m.id}
        />
        <p className="pt-4 font-mono text-xs text-text-muted">embedding models</p>
        <DocsTable
          columns={[
            {
              header: "model",
              cell: (m: (typeof EMBEDDING_MODEL_ROWS)[number]) => m.id,
              emphasis: true,
            },
            { header: "dimensions", cell: (m: (typeof EMBEDDING_MODEL_ROWS)[number]) => m.dims },
            {
              header: "notes",
              cell: (m: (typeof EMBEDDING_MODEL_ROWS)[number]) => m.note,
              className: "font-sans",
            },
          ]}
          rows={EMBEDDING_MODEL_ROWS}
          rowKey={(m) => m.id}
        />
      </Section>

      <Section id="free-tier" title="Free tier">
        <p>
          Every account gets <span className="text-text-primary">1000 chat requests</span> as a
          lifetime allowance, <span className="text-text-primary">50 images per day</span>, and a
          daily video allowance, all resetting at 00:00 UTC. Nothing is charged until the chat
          allowance is spent, and in practice ordinary usage never reaches the paid path.
        </p>
        <p>
          Allowances are per account and identical for everyone — ORVX holdings do not change them
          today. Read the live figures rather than assuming:
        </p>
        <CodeBlock
          language="bash"
          code={`curl ${base}/account/quota \\
  -H "Authorization: Bearer orvx_sk_..."

# => {
#   "chat":  { "type": "free_tier", "lifetime_free_used": 12,
#              "lifetime_free_limit": 1000 },
#   "image": { "type": "grace_daily", "used_today": 3, "daily_limit": 50,
#              "generated_images_last_24h": [] },
#   "video": { "type": "grace_daily", "used_today": 0, "daily_limit": 3 }
# }`}
        />
        <p>
          Chat responses also carry <Mono>X-Orvix-Quota-Type</Mono> and{" "}
          <Mono>X-Orvix-Quota-Remaining</Mono>, so usage can be tracked without a second request.
        </p>
      </Section>

      <Section id="pricing" title="Pricing" wide>
        <p className="max-w-2xl">
          Past the free allowance, chat is metered per token and images per area, both settled in
          USDC against your balance. Billing is USDC-only — ORVX is never spent on fees; it affects
          pricing only through the stake-based discount below. Video and embeddings have no price
          yet: both are free during the alpha, each behind its own daily allowance.
        </p>
        <p className="max-w-2xl">
          Chat rates are in the{" "}
          <Link href="#models" className="text-text-primary hover:text-accent-hover">
            model table
          </Link>{" "}
          above. Images cost <span className="text-text-primary">0.05 USDC per megapixel</span>,
          scaled by area — a 1024 × 1024 image is roughly 0.05 USDC, a 512 × 512 a quarter of that.
          The exact amount charged comes back in <Mono>X-Orvix-Cost</Mono>.
        </p>
        <p className="max-w-2xl">
          Staking ORVX derives your tier, which discounts every charge, raises your per-minute
          ceiling, and — at gold and diamond — puts your requests on the least-loaded node first.
          Tier comes from staked ORVX, not wallet balance.
        </p>
        <DocsTable
          columns={[
            { header: "tier", cell: (t: Tier) => t.tier, emphasis: true },
            { header: "staked ORVX", cell: (t: Tier) => t.stake },
            { header: "discount", cell: (t: Tier) => t.discount },
            { header: "requests / min", cell: (t: Tier) => t.rpm },
            { header: "node selection", cell: (t: Tier) => t.routing, className: "font-sans" },
          ]}
          rows={TIERS}
          rowKey={(t) => t.tier}
        />
        <p className="max-w-2xl pt-2 text-sm">
          <Mono>GET /v1/account/tier</Mono> returns your current tier, discount, and how much more
          stake the next one needs.
        </p>
      </Section>

      <Section id="rate-limits" title="Rate limits">
        <p>
          Limits are per API key, per minute, and counted separately for chat, images, video, and
          embeddings — a burst of images does not spend your chat allowance. The ceiling is the one
          shown for your tier above. Exceeding it returns <Mono>429</Mono> with everything needed to
          back off.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded: max 60 chat requests per minute on the bronze tier",
    "request_id": "b0f1…",
    "tier": "bronze",
    "bucket": "chat",
    "limit_per_minute": 60,
    "retry_after_seconds": 42,
    "upgrade_url": "https://orvix.network/pricing"
  }
}`}
        />
      </Section>

      <Section id="errors" title="Errors" wide>
        <p className="max-w-2xl">
          Every error uses the same envelope. <Mono>code</Mono> is stable and safe to branch on,{" "}
          <Mono>message</Mono> is for humans, and <Mono>request_id</Mono> identifies the request in
          the orchestrator logs — quote it when reporting a problem. Some codes add fields.
        </p>
        <p className="max-w-2xl">
          The 503s are the ones you are most likely to meet while the network is still small, and
          they call for opposite responses. <Mono>capacity_exhausted</Mono> means nodes do serve
          your model but every one was busy — and chat already waited up to three seconds internally
          for a slot, so it means the network was saturated for that whole window. Retry it.
        </p>
        <CodeBlock
          language="json"
          code={`// 503 — busy. Retry after the given delay.
{
  "error": {
    "code": "capacity_exhausted",
    "message": "All compute providers serving this model are busy. Retry shortly.",
    "request_id": "b0f1…",
    "retry_after_seconds": 3
  }
}`}
        />
        <p className="max-w-2xl">
          <Mono>no_chat_provider</Mono> (and the per-model <Mono>no_image_provider</Mono>,{" "}
          <Mono>no_video_provider</Mono>, and <Mono>no_embedding_provider</Mono> for their
          endpoints) means no node on the network serves that model at all. Retrying cannot change
          that — call{" "}
          <Mono>/v1/models</Mono> and pick one with <Mono>available: true</Mono>.
        </p>
        <CodeBlock
          language="json"
          code={`// 503 — nobody serves this model. Switch models, do not retry.
{
  "error": {
    "code": "no_chat_provider",
    "message": "No compute providers are currently available",
    "request_id": "c7a2…"
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

      <Section id="billing" title="Billing and top-up">
        <p>
          Balances are funded with USDC on Solana mainnet.{" "}
          <Mono>POST /v1/billing/topup-intent</Mono> returns a treasury address, a memo, and a{" "}
          <Mono>solana:</Mono> QR payload. Send the USDC, and a listener credits your balance
          automatically — typically within 15 to 30 seconds.
        </p>
        <CodeBlock
          language="bash"
          code={`curl -X POST ${base}/billing/topup-intent \\
  -H "Authorization: Bearer <JWT>" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 25}'

# => {
#   "id": "...",
#   "treasury_address": "...",
#   "memo": "orvix_topup_…",
#   "expected_amount": "25",
#   "qr_data": "solana:…",
#   "expires_at": "..."
# }`}
        />
        <p>
          The memo is recommended but no longer required. Attribution tries the memo first, then
          falls back to matching the sending wallet against the one registered on your account — so
          a deposit sent from your own wallet is credited either way.
        </p>
        <p>
          <span className="text-text-primary">One case still needs the memo:</span> a withdrawal
          sent from an exchange is signed by the exchange&apos;s hot wallet, not yours, so nothing
          about the sender identifies you. Without the memo such a deposit cannot be attributed.
        </p>
        <p>
          <Mono>GET /v1/billing/balance</Mono>, <Mono>/transactions</Mono> and{" "}
          <Mono>/topup-intents</Mono> cover the rest: current balance, history, and intents still
          awaiting a deposit.
        </p>
      </Section>

      <Section id="providers" title="Providers">
        <p>
          Running a GPU is a separate role from calling the API. Registration, node management,
          earnings and withdrawals live under <Mono>/v1/provider/*</Mono>, all JWT-authenticated.
          Providers earn <span className="text-text-primary">70%</span> of each job&apos;s cost,
          paid in USDC.
        </p>
        <p>
          Withdrawals start at <span className="text-text-primary">1 USDC</span>, and an account may
          request up to <span className="text-text-primary">5 per day</span>. Requests above 10,000
          USDC are flagged for manual approval rather than paid automatically, so a large withdrawal
          will sit queued until an operator handles it — plan around that rather than treating it as
          instant.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
          <Link
            href={routes.providers}
            className="inline-flex items-center gap-1.5 text-text-primary transition-colors hover:text-accent-hover"
          >
            Run a node <ArrowRight size={14} />
          </Link>
          <a
            href="https://pypi.org/project/orvix-node/"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            orvix-node on PyPI
          </a>
        </div>
      </Section>

      <Section id="public" title="Public endpoints">
        <p>
          Three areas need no credential at all, which makes them convenient for dashboards and
          monitoring.
        </p>
        <p>
          <Mono>GET /v1/network/stats</Mono> is the network dashboard feed: nodes online, GPU
          breakdown, request and token volume, and how many catalog models actually have a node
          behind them.
        </p>
        <p>
          <Mono>GET /v1/staking/buyback-history</Mono>, <Mono>/burn-history</Mono> and{" "}
          <Mono>/network-stats</Mono> cover the token side, each event carrying its Solana signature
          so it can be verified independently. Stake intents, unstaking and personal stake status
          sit alongside them under a JWT.
        </p>
        <p>
          <Mono>GET /v1/governance/snapshot-url</Mono> returns the Snapshot space used for off-chain
          voting.
        </p>
      </Section>

      <Section id="endpoints" title="Endpoint reference" wide>
        <p className="max-w-2xl">
          Everything the public API exposes, grouped by area. Paths are relative to{" "}
          <Mono>{config.apiUrl}</Mono>; the frontend calls them same-origin under <Mono>/v1</Mono>.
          Operator-only admin endpoints exist behind a separate header and are not part of this
          surface.
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

      <Section id="node" title="Running a node">
        <p>
          The provider endpoints above are the account side of running hardware. The machine itself
          runs <Mono>orvix-node</Mono>, a Python agent published on PyPI: it holds an outbound
          WebSocket to the orchestrator, registers its GPU, and serves the chat, image, video, and
          embedding jobs it is dispatched. No inbound port required.
        </p>
        <CodeBlock
          language="bash"
          code={`pip install orvix-node
orvix-node join     # provider_id + node_secret from /v1/provider/register
orvix-node start`}
        />
        <p>
          Inference is mocked until you switch the backend to vLLM, so you can verify the connection
          before committing a GPU. See the{" "}
          <Link href={routes.providers} className="text-text-primary hover:text-accent-hover">
            provider guide
          </Link>{" "}
          for hardware requirements, configuration, and the full command list.
        </p>
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
