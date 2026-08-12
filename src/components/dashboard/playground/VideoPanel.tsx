"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clapperboard,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/lib/store/hooks";
import { usePlaygroundKey } from "@/lib/inference/usePlaygroundKey";
import {
  getVideoAvailability,
  getVideoJob,
  isTerminalVideoStatus,
  submitVideoJob,
  VideoError,
  type VideoAvailability,
  type VideoJob,
} from "@/lib/inference/video";
import {
  DEFAULT_VIDEO_MODEL,
  VIDEO_DURATION,
  VIDEO_MODELS,
  VIDEO_POLL_INTERVAL_MS,
  VIDEO_PREVIEW,
  VIDEO_PROMPT_LIMITS,
} from "@/lib/constants/models";

const selectClass = cn(
  "w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm",
  "font-mono text-text-primary focus:border-accent focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** One-click starters for the prompt box. Static — no request behind them. */
const PROMPT_IDEAS = [
  "A drone shot over a coastline at sunrise, slow and smooth",
  "A tiny robot walking through a neon-lit city street at night",
  "Time-lapse of clouds moving over a mountain ridge",
  "A fox sprinting through fresh snow in slow motion",
];

type GateState = "checking" | "unavailable" | "waitingGpu" | "ready";

interface VideoFailure {
  status: number;
  message: string;
  timeout: boolean;
}

interface VideoResult {
  job: VideoJob;
  prompt: string;
  duration: number;
  elapsedMs: number;
}

async function download(url: string) {
  const filename = `orvix-video-${Date.now()}.mp4`;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    // Cross-origin fetch may be blocked — fall back to opening the clip.
    window.open(url, "_blank", "noopener");
  }
}

/** Map an API failure to a headline, detail, and optional upgrade CTA. */
function describeError(err: VideoFailure): {
  headline: string;
  detail: string;
  cta: { label: string; href: string } | null;
} {
  switch (err.status) {
    case 402:
      return {
        headline: "Quota exceeded",
        detail: err.message,
        cta: { label: "Buy ORVX or top up USDC", href: "/pricing" },
      };
    case 403:
      return {
        headline: "Holders only",
        detail: err.message,
        cta: { label: "Learn about ORVX", href: "/tokenomics" },
      };
    case 429:
      return {
        headline: "Daily limit reached",
        detail: err.message || "Try again after your daily quota resets.",
        cta: null,
      };
    case 503:
      return {
        headline: "No video providers available",
        detail: "Every video node is busy or offline right now. Try again in a little while.",
        cta: null,
      };
    default:
      return {
        headline: err.timeout ? "Timed out" : "Generation failed",
        detail: err.message || "Something went wrong. Please try again.",
        cta: null,
      };
  }
}

/**
 * The video tab.
 *
 * There is no live endpoint to call — the network serves no video yet, and
 * `orvix-video-1` is not in `GET /v1/models`. Rather than a static advert, this
 * panel checks the live catalog on mount: the moment the backend lists a video
 * model with `available: true`, the full form (prompt, duration, submit, job
 * polling, progress, player) activates on its own. Until then it says so
 * honestly, with no inert box that invites typing into nothing.
 */
export function VideoPanel() {
  const token = useAppSelector((s) => s.auth.token);
  const { wallet, ensureApiKey, forgetKey } = usePlaygroundKey();

  // The gate: what the live catalog says about video.
  const [gate, setGate] = useState<GateState>("checking");
  const [availability, setAvailability] = useState<VideoAvailability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<number>(VIDEO_DURATION.default);
  const [history, setHistory] = useState<string[]>([]);

  // A running job and its latest known progress.
  const [job, setJob] = useState<VideoJob | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [failure, setFailure] = useState<VideoFailure | null>(null);

  const pollRef = useRef<number | null>(null);
  // Values the poll loop needs but must not re-create it over: the prompt and
  // duration of the job currently rendering.
  const jobMetaRef = useRef<{ prompt: string; duration: number; startedAt: number } | null>(null);

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Ask the catalog once on mount. This is the single gate between the honest
  // "not here yet" view and the working form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const availability_ = await getVideoAvailability();
        if (cancelled) return;
        setAvailability(availability_);
        setGate(
          availability_.model
            ? availability_.available
              ? "ready"
              : "waitingGpu"
            : "unavailable",
        );
      } catch (e) {
        if (cancelled) return;
        setAvailabilityError((e as Error).message || "Could not check video availability.");
        setGate("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = prompt.trim();
  const tooShort = trimmed.length < VIDEO_PROMPT_LIMITS.min;
  const canGenerate = !!token && !tooShort;

  const submit = async () => {
    if (!canGenerate) return;
    const text = trimmed;
    setFailure(null);
    setResult(null);

    const params = { model: DEFAULT_VIDEO_MODEL, prompt: text, durationSeconds: duration };
    try {
      let res;
      try {
        res = await submitVideoJob(params, { apiKey: await ensureApiKey() });
      } catch (e) {
        // Rotate a rejected key (401) and retry once, mirroring chat/image.
        if (e instanceof VideoError && e.status === 401 && wallet) {
          forgetKey();
          res = await submitVideoJob(params, { apiKey: await ensureApiKey(true) });
        } else {
          throw e;
        }
      }
      jobMetaRef.current = { prompt: text, duration, startedAt: Date.now() };
      setJob({ id: res.jobId, status: "queued", progress: null });
      setGenerating(true);
      setHistory((h) => [text, ...h.filter((p) => p !== text)].slice(0, 5));
    } catch (e) {
      setFailure(
        e instanceof VideoError
          ? { status: e.status, message: e.message, timeout: e.timeout }
          : { status: 0, message: (e as Error).message || "Something went wrong.", timeout: false },
      );
    }
  };

  // Poll a running job. Kept in an effect keyed only on `generating` so the
  // interval is created once per job and torn down when the job resolves.
  useEffect(() => {
    if (!generating || !job) return;
    const jobId = job.id;
    let apiKey: string | null = null;
    let cancelled = false;

    const tick = async () => {
      if (!apiKey) {
        try {
          apiKey = await ensureApiKey();
        } catch (e) {
          if (cancelled) return;
          stopPolling();
          setGenerating(false);
          setFailure({
            status: 0,
            message: (e as Error).message || "Could not mint an API key.",
            timeout: false,
          });
          return;
        }
      }
      try {
        const next = await getVideoJob(jobId, { apiKey });
        if (cancelled) return;
        setJob(next);
        if (isTerminalVideoStatus(next.status)) {
          stopPolling();
          setGenerating(false);
          const meta = jobMetaRef.current;
          if (next.status === "failed") {
            setFailure({
              status: 0,
              message: next.error || "The video job failed. Try again.",
              timeout: false,
            });
          } else {
            setResult({
              job: next,
              prompt: meta?.prompt ?? "",
              duration: meta?.duration ?? duration,
              elapsedMs: Date.now() - (meta?.startedAt ?? Date.now()),
            });
          }
        }
      } catch (e) {
        if (cancelled) return;
        // A transient poll failure should not kill the job — keep polling. A
        // 4xx means the job no longer exists; give up rather than spin.
        const status = e instanceof VideoError ? e.status : 0;
        if (status >= 400 && status < 500) {
          stopPolling();
          setGenerating(false);
          setFailure({ status, message: (e as Error).message, timeout: false });
        }
      }
    };

    void tick();
    pollRef.current = window.setInterval(() => void tick(), VIDEO_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generating]);

  if (gate === "checking") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <PanelHeader />
        <div className="flex h-48 items-center justify-center gap-3 text-sm text-text-tertiary">
          <Loader2 size={18} className="animate-spin text-accent" />
          Checking whether the network serves video…
        </div>
      </div>
    );
  }

  if (gate === "unavailable") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <PanelHeader />
        <p className="text-sm text-text-secondary">{VIDEO_PREVIEW.summary}</p>

        <div className="space-y-2 rounded-md border border-border bg-bg-secondary p-4">
          <p className="text-sm text-text-secondary">{VIDEO_PREVIEW.state}</p>
          <p className="text-sm text-text-tertiary">{VIDEO_PREVIEW.hardware}</p>
        </div>

        {availabilityError && <p className="text-xs text-warning">{availabilityError}</p>}

        <p className="text-xs text-text-tertiary">
          This panel re-checks the catalog on every load. When video joins the network, the model
          shows up in <span className="font-mono text-text-secondary">GET /v1/models</span> and this
          tab becomes interactive on its own.
        </p>
      </div>
    );
  }

  if (gate === "waitingGpu") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <PanelHeader />
        <p className="text-sm text-text-secondary">{VIDEO_PREVIEW.summary}</p>

        <div className="space-y-2 rounded-md border border-border bg-bg-secondary p-4">
          <p className="text-sm text-text-secondary">
            The video model is in the catalog, but no node is serving it right now — the renderer
            needs a free GPU and a clip takes minutes, during which the machine serves nothing else.
          </p>
          <p className="text-sm text-text-tertiary">{VIDEO_PREVIEW.hardware}</p>
        </div>

        <p className="text-xs text-text-tertiary">
          The moment a GPU node advertises video, this tab activates. Reload to re-check.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Input form ─────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="video-prompt" className="text-xs text-text-secondary">
            Prompt
          </label>
          <Textarea
            id="video-prompt"
            rows={4}
            maxLength={VIDEO_PROMPT_LIMITS.max}
            placeholder="A drone shot over a coastline at sunrise…"
            value={prompt}
            disabled={generating}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>{tooShort ? `Minimum ${VIDEO_PROMPT_LIMITS.min} characters` : " "}</span>
            <span className="font-mono">
              {trimmed.length}/{VIDEO_PROMPT_LIMITS.max}
            </span>
          </div>
        </div>

        {prompt.trim() === "" && (
          <div className="space-y-2">
            <div className="text-[11px] text-text-muted">Try one of these</div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  disabled={generating}
                  onClick={() => setPrompt(idea)}
                  className={cn(
                    "max-w-[220px] truncate rounded-full border border-border bg-bg-secondary px-3 py-1",
                    "text-xs text-text-secondary hover:border-border-strong hover:text-text-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2 border-t border-dashed border-border pt-4">
            <div className="text-[11px] text-text-muted">Recent prompts</div>
            <div className="flex flex-wrap gap-1.5">
              {history.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  disabled={generating}
                  onClick={() => setPrompt(p)}
                  title={p}
                  className={cn(
                    "max-w-[220px] truncate rounded-full border border-border bg-bg-secondary px-3 py-1",
                    "text-xs text-text-secondary hover:border-border-strong hover:text-text-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-dashed border-border pt-4">
          <div className="space-y-1.5">
            <label htmlFor="video-model" className="text-xs text-text-secondary">
              Model
            </label>
            <select id="video-model" value={DEFAULT_VIDEO_MODEL} disabled className={selectClass}>
              {VIDEO_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="video-duration" className="text-xs text-text-secondary">
              Duration
            </label>
            <select
              id="video-duration"
              value={duration}
              disabled={generating}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={selectClass}
            >
              {Array.from(
                { length: VIDEO_DURATION.max - VIDEO_DURATION.min + 1 },
                (_, i) => i + VIDEO_DURATION.min,
              ).map((v) => (
                <option key={v} value={v}>
                  {v}s
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 border-t border-dashed border-border pt-4">
          <Button variant="primary" className="w-full" onClick={submit} disabled={!canGenerate}>
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Rendering…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate video
              </>
            )}
          </Button>
          {!token && (
            <p className="text-center text-xs text-text-tertiary">
              Connect your wallet to generate videos
            </p>
          )}
        </div>
      </div>

      {/* ── Result display ─────────────────────────────────────── */}
      <div className="min-h-[320px] rounded-lg border border-border bg-bg-secondary p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Result
        </div>
        {generating ? (
          <GeneratingView job={job} />
        ) : failure ? (
          <ErrorView error={failure} onRetry={submit} canRetry={canGenerate} />
        ) : result ? (
          <ResultView result={result} />
        ) : (
          <div className="flex h-full min-h-[288px] flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border-strong bg-bg-tertiary">
              <Clapperboard size={22} className="text-text-muted" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-text-tertiary">Your generated clip will appear here</p>
              <p className="text-xs text-text-muted">Describe the shot, then hit Generate video.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Shared heading for the checking / unavailable / waiting views. */
function PanelHeader() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Clapperboard size={16} className="text-text-tertiary" />
        <h2 className="text-sm font-medium text-text-primary">Video generation</h2>
      </div>
      <Badge className="border-border-strong text-text-tertiary">coming soon</Badge>
    </div>
  );
}

/** Job progress while a clip renders. Presentational — the parent polls. */
function GeneratingView({ job }: { job: VideoJob | null }) {
  const progress = job?.progress ?? null;
  const phase = job?.status === "processing" ? "processing" : "queued";
  return (
    <div className="flex h-full min-h-[288px] flex-col items-center justify-center gap-4 text-center">
      <Loader2 size={22} className="animate-spin text-accent" />
      <div className="space-y-1">
        <p className="text-sm text-text-secondary">
          {phase === "queued" ? "Your clip is queued…" : "Rendering your clip…"}
        </p>
        <p className="text-xs text-text-muted">A short clip takes minutes. This box updates on its own.</p>
      </div>
      <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-bg-tertiary">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress ?? undefined}
          className={cn(
            "h-full rounded-full bg-accent transition-all",
            !progress && "animate-pulse",
          )}
          style={progress ? { width: `${Math.min(100, Math.max(0, progress))}%` } : { width: "40%" }}
        />
      </div>
      {job && <p className="font-mono text-[11px] text-text-muted">{job.id}</p>}
    </div>
  );
}

function ErrorView({
  error,
  onRetry,
  canRetry,
}: {
  error: VideoFailure;
  onRetry: () => void;
  canRetry: boolean;
}) {
  const { headline, detail, cta } = describeError(error);
  return (
    <div className="flex h-full min-h-[288px] flex-col items-center justify-center gap-3 text-center">
      <AlertTriangle size={22} className="text-danger" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{headline}</p>
        <p className="mx-auto max-w-xs text-xs text-text-secondary">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        {cta && (
          <Link href={cta.href}>
            <Button variant="primary">{cta.label}</Button>
          </Link>
        )}
        <Button variant="secondary" onClick={onRetry} disabled={!canRetry}>
          <RotateCcw size={13} /> Retry
        </Button>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: VideoResult }) {
  const { job, prompt, duration, elapsedMs } = result;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-border-strong text-text-secondary">{duration}s clip</Badge>
        <Badge className="border-border-strong text-text-secondary">{DEFAULT_VIDEO_MODEL}</Badge>
      </div>

      {job.video_url ? (
        <video
          src={job.video_url}
          controls
          preload="metadata"
          className="w-full rounded-md border border-border bg-bg-tertiary"
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-md border border-border bg-bg-tertiary">
          <p className="text-xs text-text-tertiary">No video URL in the job response.</p>
        </div>
      )}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => void download(job.video_url!)}
        disabled={!job.video_url}
      >
        <Download size={13} /> Download
      </Button>

      <dl className="space-y-1.5 border-t border-dashed border-border pt-3 text-xs">
        <Meta label="Prompt" value={prompt} />
        <Meta label="Duration" value={`${duration}s`} />
        <Meta label="Job" value={job.id} className="font-mono" />
        <Meta label="Generated in" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
      </dl>

      <p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-2.5 text-[11px] text-text-secondary">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
        Clips expire — download to keep a copy.
      </p>
    </div>
  );
}

function Meta({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-text-muted">{label}</dt>
      <dd className={cn("min-w-0 flex-1 break-words text-text-secondary", className)}>{value}</dd>
    </div>
  );
}
