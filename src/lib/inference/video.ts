import { config } from "@/lib/constants/config";
import { DEFAULT_VIDEO_MODEL } from "@/lib/constants/models";

export interface VideoParams {
  model: string;
  prompt: string;
  durationSeconds: number;
}

/** Job lifecycle states the video endpoint reports. */
export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export interface VideoJob {
  id: string;
  status: VideoJobStatus;
  /** Present once `status` is "completed". Expires, like generated images. */
  video_url?: string | null;
  /** 0–100 when the backend reports one; null means indeterminate. */
  progress?: number | null;
  error?: string | null;
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

export function isTerminalVideoStatus(status: VideoJobStatus): boolean {
  return status === "completed" || status === "failed";
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

/** Fetch with a client-side timeout that surfaces as a VideoError. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (timedOut) throw new VideoError(timeoutMessage, 0, { timeout: true });
    throw new VideoError("Network error — check your connection and try again.", 0);
  } finally {
    clearTimeout(timer);
  }
}

function authHeaders(apiKey: string | null): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };
}

const SHORT_TIMEOUT_MS = 30_000;

/**
 * Ask the catalog whether the network serves video.
 *
 * `GET /v1/models` is public and needs no API key. The response is an OpenAI
 * list — `{ object: "list", data: [...] }` — with each entry carrying an
 * Orvix-specific `available` boolean. A video model present but unavailable
 * means the engine exists on some node but no GPU is free to render.
 */
export async function getVideoAvailability(): Promise<VideoAvailability> {
  const res = await fetchWithTimeout(
    `${config.apiUrl}/v1/models`,
    { method: "GET" },
    SHORT_TIMEOUT_MS,
    "Checking video availability timed out. Try again.",
  );
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
 * Start a video generation job via POST /v1/videos/generations.
 *
 * Video rendering is slow (a clip takes minutes), so the endpoint is expected
 * to accept the job and return its id immediately; the caller then polls with
 * {@link getVideoJob}. Authenticates with an Orvix API key (orvx_sk_…), same as
 * chat and image.
 *
 * NOTE: this endpoint does not exist yet — the network serves no video. It is
 * wired so the moment the backend ships it (and lists `orvix-video-1` in the
 * catalog), this panel starts working without further changes.
 */
export async function submitVideoJob(
  params: VideoParams,
  opts: { apiKey: string | null },
): Promise<{ jobId: string }> {
  const res = await fetchWithTimeout(
    `${config.apiUrl}/v1/videos/generations`,
    {
      method: "POST",
      headers: authHeaders(opts.apiKey),
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        duration_seconds: params.durationSeconds,
        response_format: "url",
      }),
    },
    SHORT_TIMEOUT_MS,
    "Submitting the video job timed out. Try again.",
  );
  if (!res.ok) throw new VideoError(await readError(res), res.status);

  const body = await res.json();
  const jobId = body?.id ?? body?.job_id ?? body?.data?.[0]?.id;
  if (typeof jobId !== "string" || !jobId) {
    throw new VideoError("The video endpoint did not return a job id.", 0);
  }
  return { jobId };
}

/** Fetch one job's status via GET /v1/videos/{id}. */
export async function getVideoJob(
  jobId: string,
  opts: { apiKey: string | null },
): Promise<VideoJob> {
  const res = await fetchWithTimeout(
    `${config.apiUrl}/v1/videos/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: authHeaders(opts.apiKey),
    },
    SHORT_TIMEOUT_MS,
    "Checking the video job timed out. Try again.",
  );
  if (!res.ok) throw new VideoError(await readError(res), res.status);

  const body = await res.json();
  return {
    id: body?.id ?? jobId,
    status: body?.status ?? "processing",
    video_url: body?.video_url ?? body?.url ?? null,
    progress: typeof body?.progress === "number" ? body.progress : null,
    error: body?.error ?? null,
  };
}
