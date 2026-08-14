import { config } from "@/lib/constants/config";
import { DEFAULT_VIDEO_MODEL } from "@/lib/constants/models";

/** What the playground sends for one clip. `durationSeconds` is client-side
 *  only: the backend derives clip length from num_frames + fps. */
export interface VideoParams {
  model: string;
  prompt: string;
  durationSeconds: number;
}

/** The synchronous response from POST /v1/videos/generations. */
export interface VideoResult {
  /** Public URL of the finished clip. */
  url: string;
  /** Wall-clock the render took, measured client-side (ms). */
  elapsedMs: number;
  /** From the X-Orvix-Quota-Remaining response header, when present. */
  quotaRemaining: number | null;
  /** From the X-Orvix-Quota-Reset response header, when present. */
  quotaReset: string | null;
}

/**
 * What the live catalog says about video. `GET /v1/models` is the source of
 * truth for what the network can serve; a video model only becomes callable
 * once it is listed there with `available: true`.
 */
export interface VideoAvailability {
  /** The video model the catalog advertises, or null when it lists none. */
  model: { id: string; label: string } | null;
  /** True when a video model is listed AND a node currently serves it. */
  available: boolean;
  /** True when the model is listed but no node serves it yet (no GPU). */
  waitingForGpu: boolean;
}

/**
 * Error thrown by the video client. `status` is the HTTP status (0 for
 * network/timeout failures); `timeout` marks a client-side timeout.
 */
export class VideoError extends Error {
  status: number;
  timeout: boolean;
  constructor(message: string, status: number, opts?: { timeout?: boolean }) {
    super(message);
    this.name = "VideoError";
    this.status = status;
    this.timeout = opts?.timeout ?? false;
  }
}

/** Pull a human-readable message out of an error body. */
async function readError(res: Response): Promise<string> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    // OpenAI-style: { error: { message } }; FastAPI-style: { detail }.
    if (typeof body?.error?.message === "string") message = body.error.message;
    else if (typeof body?.detail === "string") message = body.detail;
    else if (Array.isArray(body?.detail) && body.detail[0]?.msg) message = body.detail[0].msg;
  } catch {
    /* non-JSON body — keep the generic message */
  }
  return message;
}

function numOrNull(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Ask the catalog whether the network serves video.
 *
 * `GET /v1/models` is public and needs no API key. The response is an OpenAI
 * list — `{ object: "list", data: [...] }` — with each entry carrying an
 * Orvix-specific `available` boolean. A video model present but unavailable
 * means the engine exists on some node but no GPU is free to render.
 */
export async function getVideoAvailability(): Promise<VideoAvailability> {
  const res = await fetch(`${config.apiUrl}/v1/models`, { method: "GET" });
  if (!res.ok) throw new VideoError(await readError(res), res.status);

  const body = await res.json();
  const list = Array.isArray(body) ? body : body?.data;
  const entry = Array.isArray(list)
    ? (list as { id?: string; available?: boolean }[]).find((m) => m.id === DEFAULT_VIDEO_MODEL)
    : null;

  if (!entry) return { model: null, available: false, waitingForGpu: false };
  return {
    model: { id: entry.id!, label: entry.id! },
    available: entry.available === true,
    waitingForGpu: entry.available !== true,
  };
}

/**
 * Render a clip via POST /v1/videos/generations.
 *
 * The endpoint is synchronous, mirroring the image path: it holds the request
 * open while the node renders (a short clip takes tens of seconds), then
 * returns an OpenAI-shaped `{ created, data: [{ url }] }`. Authenticates with
 * an Orvix API key (orvx_sk_…), same as chat and image.
 *
 * The backend derives clip length from num_frames + fps — there is no
 * `duration_seconds` field. VideoPanel maps the user's duration choice to
 * frame counts before calling this.
 */
const VIDEO_TIMEOUT_MS = 180_000;

export async function generateVideo(
  params: VideoParams,
  opts: { apiKey: string | null },
): Promise<VideoResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, VIDEO_TIMEOUT_MS);

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}/v1/videos/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        // 5s → 97 frames, 10s → 193 frames (the backend max is 257). fps 24.
        num_frames: params.durationSeconds === 10 ? 193 : 97,
        fps: 24,
        response_format: "url",
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (timedOut) {
      throw new VideoError(
        "Video generation timed out (3 min max). Try a shorter clip or a simpler prompt.",
        0,
        { timeout: true },
      );
    }
    throw new VideoError("Network error — check your connection and try again.", 0);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new VideoError(await readError(res), res.status);

  const elapsedMs = Date.now() - started;
  const body = await res.json();
  const url = body?.data?.[0]?.url ?? body?.url;
  if (typeof url !== "string" || !url) {
    throw new VideoError("The video endpoint did not return a clip URL.", 0);
  }
  return {
    url,
    elapsedMs,
    quotaRemaining: numOrNull(res.headers.get("X-Orvix-Quota-Remaining")),
    quotaReset: res.headers.get("X-Orvix-Quota-Reset"),
  };
}
