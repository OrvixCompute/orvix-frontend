"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/lib/utils/cn";

const SNIPPETS = {
  python: {
    language: "python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.orvix.xyz/v1",
    api_key="orvx_sk_..."
)

response = client.chat.completions.create(
    model="qwen-2.5-7b",
    messages=[{"role": "user", "content": "Hello"}]
)`,
  },
  node: {
    language: "javascript",
    code: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.orvix.xyz/v1',
  apiKey: 'orvx_sk_...'
});

const response = await client.chat.completions.create({
  model: 'qwen-2.5-7b',
  messages: [{ role: 'user', content: 'Hello' }]
});`,
  },
  curl: {
    language: "bash",
    code: `curl https://api.orvix.xyz/v1/chat/completions \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-2.5-7b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`,
  },
} as const;

type Tab = keyof typeof SNIPPETS;

const TABS: { id: Tab; label: string }[] = [
  { id: "python", label: "Python" },
  { id: "node", label: "Node" },
  { id: "curl", label: "curl" },
];

export function CodeExample() {
  const [tab, setTab] = useState<Tab>("python");
  const snippet = SNIPPETS[tab];

  return (
    <div className="space-y-3">
      <span className="font-mono text-xs text-text-muted">drop-in OpenAI replacement</span>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-mono transition-colors",
              tab === t.id
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={snippet.code} language={snippet.language} />
    </div>
  );
}
