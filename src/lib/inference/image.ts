import { config } from "@/lib/constants/config";

export interface ImageParams {
  model: string;
  prompt: string;
  n: number;
  size: string;
}

/** One generated image in an OpenAI-compatible images response. */
export interface ImageDatum {
  url: string;
  seed?: number | string | null;
  revised_prompt?: string | null;
}

export interface ImageResult {
  data: ImageDatum[];
  /** Wall-clock the request took, measured client-side (ms). */
  elapsedMs: number;
  /** From the X-Orvix-Quota-Remaining response header, when present. */
  quotaRemaining: number | null;
  /** From the X-Orvix-Quota-Reset response header, when present. */
  quotaReset: string | null;
}

/**
 * Error thrown by generateImage. `status` is the HTTP status (0 for
 * network/timeout failures). `timeout` marks a client-side timeout, and
 * `resetAt` carries the daily-quota reset time when the backend supplies it.
 */
export class ImageError extends Error {
  status: number;
  timeout: boolean;
  resetAt: string | null;
  constructor(
    message: string,
    status: number,
    opts?: { timeout?: boolean; resetAt?: string | null },
  ) {
    super(message);
    this.name = "ImageError";
    this.status = status;
    this.timeout = opts?.timeout ?? false;
    this.resetAt = opts?.resetAt ?? null;
  }
}

/** Pull a human-readable message (and any reset hint) out of an error body. */
async function readError(res: Response): Promise<{ message: string; resetAt: string | null }> {
  let message = `Request failed (${res.status})`;
  let resetAt: string | null = null;
  try {
    const body = await res.json();
    // OpenAI-style: { error: { message } }; FastAPI-style: { detail }.
    if (typeof body?.error?.message === "string") message = body.error.message;
    else if (typeof body?.detail === "string") message = body.detail;
    else if (Array.isArray(body?.detail) && body.detail[0]?.msg) message = body.detail[0].msg;
    if (typeof body?.reset_at === "string") resetAt = body.reset_at;
    else if (typeof body?.error?.reset_at === "string") resetAt = body.error.reset_at;
  } catch {
    /* non-JSON body — keep the generic message */
  }
  return { message, resetAt };
}

function numOrNull(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Image generation can involve a model swap on the node, so give it room. */
const IMAGE_TIMEOUT_MS = 90_000;

/**
 * Generate images via POST /v1/images/generations (OpenAI DALL·E compatible).
 * Authenticates with an Orvix API key (orvx_sk_…), not the wallet JWT — same as
 * {@link runChatCompletion}. Aborts after 90s and surfaces a timeout ImageError.
 */
export async function generateImage(
  params: ImageParams,
  opts: { apiKey: string | null },
): Promise<ImageResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, IMAGE_TIMEOUT_MS);

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        n: params.n,
        size: params.size,
        response_format: "url",
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (timedOut) {
      throw new ImageError(
        "Image generation timed out (90s max). Try a shorter prompt or a smaller size.",
        0,
        { timeout: true },
      );
    }
    throw new ImageError("Network error — check your connection and try again.", 0);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const { message, resetAt } = await readError(res);
    throw new ImageError(message, res.status, {
      resetAt: resetAt ?? res.headers.get("X-Orvix-Quota-Reset"),
    });
  }

  const elapsedMs = Date.now() - started;
  const body = await res.json();
  return {
    data: Array.isArray(body?.data) ? (body.data as ImageDatum[]) : [],
    elapsedMs,
    quotaRemaining: numOrNull(res.headers.get("X-Orvix-Quota-Remaining")),
    quotaReset: res.headers.get("X-Orvix-Quota-Reset"),
  };
}
