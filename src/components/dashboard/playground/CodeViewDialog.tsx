"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { config } from "@/lib/constants/config";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/lib/types/orvix";

interface CodeViewDialogProps {
  open: boolean;
  onClose: () => void;
  request: {
    model: string;
    messages: ChatMessage[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
  };
}

const TABS = [
  { id: "curl", label: "curl" },
  { id: "python", label: "Python" },
  { id: "node", label: "Node" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function buildSnippets(req: CodeViewDialogProps["request"], baseUrl: string) {
  const body = {
    model: req.model,
    messages: req.messages,
    temperature: req.temperature,
    max_tokens: req.max_tokens,
    stream: req.stream,
  };
  const jsonForCurl = JSON.stringify(body, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : `    ${l}`))
    .join("\n");
  const messagesLiteral = JSON.stringify(req.messages);

  return {
    curl: `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer orvx_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '${jsonForCurl}'`,
    python: `from openai import OpenAI

client = OpenAI(base_url="${baseUrl}/v1", api_key="orvx_sk_...")

response = client.chat.completions.create(
    model="${req.model}",
    messages=${messagesLiteral},
    temperature=${req.temperature},
    max_tokens=${req.max_tokens},
    stream=${req.stream ? "True" : "False"},
)`,
    node: `import OpenAI from 'openai';

const client = new OpenAI({ baseURL: '${baseUrl}/v1', apiKey: 'orvx_sk_...' });

const response = await client.chat.completions.create({
  model: '${req.model}',
  messages: ${messagesLiteral},
  temperature: ${req.temperature},
  max_tokens: ${req.max_tokens},
  stream: ${req.stream},
});`,
  };
}

const LANGUAGE: Record<Tab, string> = { curl: "bash", python: "python", node: "javascript" };

export function CodeViewDialog({ open, onClose, request }: CodeViewDialogProps) {
  const [tab, setTab] = useState<Tab>("curl");
  const snippets = buildSnippets(request, config.apiUrl);

  return (
    <Modal open={open} onClose={onClose} title="Request as code" className="max-w-2xl">
      <div className="space-y-3">
        <p className="text-xs text-text-tertiary">
          The same request, runnable from your terminal. Swap in one of your{" "}
          <span className="text-text-secondary">API keys</span> for the placeholder.
        </p>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                tab === t.id
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CodeBlock code={snippets[tab]} language={LANGUAGE[tab]} />
      </div>
    </Modal>
  );
}
