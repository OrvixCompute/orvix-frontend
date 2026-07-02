import { config } from "@/lib/constants/config";
import type { ChatMessage } from "@/lib/types/orvix";

export interface ChatParams {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export interface ChatUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ChatResult {
  content: string;
  usage?: ChatUsage;
}

/** Pull a human-readable message out of a FastAPI error body. */
async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    /* non-JSON body — fall through */
  }
  if (res.status === 401) return "Inference key was rejected. Reconnect your wallet and try again.";
  if (res.status === 402) return "Insufficient USDC balance. Top up to run inference.";
  return `Request failed (${res.status})`;
}

/** Error thrown by runChatCompletion, carrying the HTTP status for callers that
 *  need to react to specific failures (e.g. rotate the API key on 401). */
export class ChatError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatError";
    this.status = status;
  }
}

/**
 * Run an OpenAI-compatible chat completion against POST /v1/chat/completions.
 * Authenticates with an Orvix API key (orvx_sk_…), not the wallet JWT.
 * When `params.stream` is true, `onDelta` receives content as it arrives and the
 * resolved promise holds the full text. Throws ChatError on HTTP errors;
 * AbortError propagates so callers can distinguish a user-initiated stop.
 */
export async function runChatCompletion(
  params: ChatParams,
  opts: { apiKey: string | null; signal?: AbortSignal; onDelta?: (chunk: string) => void },
): Promise<ChatResult> {
  const res = await fetch(`${config.apiUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
    },
    body: JSON.stringify(params),
    signal: opts.signal,
  });

  if (!res.ok) throw new ChatError(await readError(res), res.status);

  if (!params.stream || !res.body) {
    const data = await res.json();
    return {
      content: data?.choices?.[0]?.message?.content ?? "",
      usage: data?.usage,
    };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let usage: ChatUsage | undefined;

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          content += delta;
          opts.onDelta?.(delta);
        }
        if (json?.usage) usage = json.usage;
      } catch {
        /* partial or non-JSON frame — skip */
      }
    }
  }

  return { content, usage };
}
