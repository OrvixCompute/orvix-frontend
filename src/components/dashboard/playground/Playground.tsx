"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, CornerDownLeft, Square, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SettingsPanel, type PlaygroundSettings } from "@/components/dashboard/playground/SettingsPanel";
import { CodeViewDialog } from "@/components/dashboard/playground/CodeViewDialog";
import { useAppSelector } from "@/lib/store/hooks";
import { runChatCompletion, type ChatUsage } from "@/lib/inference/chat";
import { DEFAULT_MODEL, GENERATION_LIMITS } from "@/lib/constants/models";
import type { ChatMessage } from "@/lib/types/orvix";

function MessageRow({
  role,
  content,
  pending,
}: {
  role: ChatMessage["role"];
  content: string;
  pending?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{role}</div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
        {content}
        {pending && <span className="ml-0.5 inline-block animate-cursor-blink">▍</span>}
      </div>
    </div>
  );
}

/** The interactive inference playground. Works for anyone — when signed out, the
 *  Send button is disabled with a prompt to connect a wallet. */
export function Playground({ subtitle }: { subtitle?: string }) {
  const token = useAppSelector((s) => s.auth.token);

  const [system, setSystem] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<PlaygroundSettings>({
    model: DEFAULT_MODEL,
    temperature: GENERATION_LIMITS.temperature.default,
    maxTokens: GENERATION_LIMITS.maxTokens.default,
    stream: true,
  });
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const patchSettings = (patch: Partial<PlaygroundSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setUsage(null);
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    const payload: ChatMessage[] = [
      ...(system.trim() ? [{ role: "system" as const, content: system.trim() }] : []),
      ...history,
    ];

    let acc = "";
    try {
      const result = await runChatCompletion(
        {
          model: settings.model,
          messages: payload,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: settings.stream,
        },
        {
          token,
          signal: controller.signal,
          onDelta: (chunk) => {
            acc += chunk;
            setStreamText((prev) => prev + chunk);
          },
        },
      );
      setMessages((m) => [...m, { role: "assistant", content: result.content }]);
      if (result.usage) setUsage(result.usage);
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") {
        if (acc) setMessages((m) => [...m, { role: "assistant", content: `${acc} …` }]);
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setStreaming(false);
      setStreamText("");
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const clear = () => {
    if (streaming) return;
    setMessages([]);
    setStreamText("");
    setError(null);
    setUsage(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const isEmpty = messages.length === 0 && !streaming;
  const codeMessages: ChatMessage[] = [
    ...(system.trim() ? [{ role: "system" as const, content: system.trim() }] : []),
    ...messages,
    ...(input.trim() ? [{ role: "user" as const, content: input.trim() }] : []),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Playground"
        subtitle={subtitle ?? "Test inference against the network."}
        actions={
          <>
            <Button variant="secondary" onClick={() => setCodeOpen(true)}>
              <Code2 size={14} /> View code
            </Button>
            <Button variant="ghost" onClick={clear} disabled={streaming || messages.length === 0}>
              <Trash2 size={14} /> Clear
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Conversation + composer */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="pg-system" className="text-xs text-text-secondary">
              System prompt <span className="text-text-muted">(optional)</span>
            </label>
            <Textarea
              id="pg-system"
              rows={2}
              placeholder="You are a helpful assistant."
              value={system}
              disabled={streaming}
              onChange={(e) => setSystem(e.target.value)}
            />
          </div>

          <div className="min-h-[280px] rounded-lg border border-border bg-bg-secondary p-4">
            {isEmpty ? (
              <div className="flex h-[248px] flex-col items-center justify-center text-center">
                <p className="text-sm text-text-tertiary">
                  Send a message to run it through the network.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((m, i) => (
                  <MessageRow key={i} role={m.role} content={m.content} />
                ))}
                {streaming && <MessageRow role="assistant" content={streamText} pending />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
              <p className="text-xs text-text-secondary">{error}</p>
            </div>
          )}

          {usage && (
            <div className="font-mono text-xs text-text-muted">
              {usage.prompt_tokens ?? "—"} prompt + {usage.completion_tokens ?? "—"} completion ={" "}
              {usage.total_tokens ?? "—"} tokens
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              rows={3}
              placeholder="Send a message…  (Enter to send, Shift+Enter for newline)"
              value={input}
              disabled={streaming}
              onKeyDown={onKeyDown}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                {token ? "Charged to your USDC balance" : "Connect your wallet to run inference"}
              </span>
              {streaming ? (
                <Button variant="secondary" onClick={stop}>
                  <Square size={13} /> Stop
                </Button>
              ) : (
                <Button variant="primary" onClick={send} disabled={!input.trim() || !token}>
                  Send <CornerDownLeft size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <SettingsPanel settings={settings} onChange={patchSettings} disabled={streaming} />
      </div>

      <CodeViewDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        request={{
          model: settings.model,
          messages: codeMessages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: settings.stream,
        }}
      />
    </div>
  );
}
