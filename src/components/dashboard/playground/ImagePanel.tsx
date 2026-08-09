"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download, ImageIcon, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/lib/store/hooks";
import { usePlaygroundKey } from "@/lib/inference/usePlaygroundKey";
import { generateImage, ImageError, type ImageDatum } from "@/lib/inference/image";
import { useGetQuotaQuery } from "@/lib/store/api/accountApi";
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_IMAGE_SIZE,
  IMAGE_COUNT,
  IMAGE_MODELS,
  IMAGE_PROMPT_LIMITS,
  coerceImageSize,
  formatImageSize,
  sizesForModel,
} from "@/lib/constants/models";
import type { QuotaResponse } from "@/lib/types/orvix";

const selectClass = cn(
  "w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm",
  "font-mono text-text-primary focus:border-accent focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

interface Success {
  images: ImageDatum[];
  prompt: string;
  size: string;
  elapsedMs: number;
}

interface Failure {
  status: number;
  message: string;
  resetAt: string | null;
  timeout: boolean;
}

/** "1/1 images remaining today (grace period)". */
function quotaLabel(q: QuotaResponse): string {
  const remaining = Math.max(0, q.image.daily_limit - q.image.used_today);
  const holder = q.image.type === "holder_daily" || q.is_holder;
  const noun = q.image.daily_limit === 1 ? "image" : "images";
  return `${remaining}/${q.image.daily_limit} ${noun} remaining today (${holder ? "holder" : "grace period"})`;
}

/** ISO timestamp → "2h 5m" until it, or null when unknown/past. */
function resetIn(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const mins = Math.ceil(ms / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function download(url: string) {
  const filename = `orvix-image-${Date.now()}.png`;
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
    // Cross-origin fetch may be blocked — fall back to opening the image.
    window.open(url, "_blank", "noopener");
  }
}

/** Map an API failure to a headline, detail, and optional upgrade CTA. */
function describeError(err: Failure): {
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
        detail: err.message || "Hold 10,000 ORVX to unlock image generation.",
        cta: { label: "Learn about ORVX", href: "/tokenomics" },
      };
    case 429: {
      const in_ = resetIn(err.resetAt);
      return {
        headline: "Daily limit reached",
        detail: in_ ? `Resets in ${in_}.` : "Try again after your daily quota resets.",
        cta: null,
      };
    }
    case 503:
      return {
        headline: "No image providers available",
        detail: "Every image node is busy or offline right now. Try again in a little while.",
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

/** Image tab of the playground. Split view: form on the left, result on the right. */
export function ImagePanel() {
  const token = useAppSelector((s) => s.auth.token);
  const { wallet, ensureApiKey, forgetKey } = usePlaygroundKey();
  const { data: quota, refetch: refetchQuota } = useGetQuotaQuery(undefined, { skip: !token });

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(DEFAULT_IMAGE_MODEL);
  const [size, setSize] = useState<string>(DEFAULT_IMAGE_SIZE);
  const [n, setN] = useState<number>(IMAGE_COUNT.default);
  const [history, setHistory] = useState<string[]>([]);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Success | null>(null);
  const [error, setError] = useState<Failure | null>(null);

  // Each image model caps the sizes it will accept, so the dropdown follows the
  // selected model rather than offering every size the endpoint understands.
  const sizeOptions = sizesForModel(model);

  const trimmed = prompt.trim();
  const tooShort = trimmed.length < IMAGE_PROMPT_LIMITS.min;
  const canGenerate = !!token && !tooShort && !generating;

  const generate = async () => {
    if (!canGenerate) return;
    const text = trimmed;
    setError(null);
    setResult(null);
    setGenerating(true);

    const params = { model, prompt: text, n, size };
    try {
      let res;
      try {
        res = await generateImage(params, { apiKey: await ensureApiKey() });
      } catch (e) {
        // Rotate a rejected key (401) and retry once, mirroring the chat panel.
        if (e instanceof ImageError && e.status === 401 && wallet) {
          forgetKey();
          res = await generateImage(params, { apiKey: await ensureApiKey(true) });
        } else {
          throw e;
        }
      }
      setResult({ images: res.data, prompt: text, size, elapsedMs: res.elapsedMs });
      setHistory((h) => [text, ...h.filter((p) => p !== text)].slice(0, 5));
    } catch (e) {
      if (e instanceof ImageError) {
        setError({ status: e.status, message: e.message, resetAt: e.resetAt, timeout: e.timeout });
      } else {
        setError({
          status: 0,
          message: (e as Error).message || "Something went wrong.",
          resetAt: null,
          timeout: false,
        });
      }
    } finally {
      setGenerating(false);
      // Quota changes on success and on some failures (e.g. a consumed attempt).
      if (token) void refetchQuota();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Input form ─────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="img-prompt" className="text-xs text-text-secondary">
            Prompt
          </label>
          <Textarea
            id="img-prompt"
            rows={4}
            maxLength={IMAGE_PROMPT_LIMITS.max}
            placeholder="A photorealistic red panda coding on a laptop, soft studio light…"
            value={prompt}
            disabled={generating}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>{tooShort ? `Minimum ${IMAGE_PROMPT_LIMITS.min} characters` : " "}</span>
            <span className="font-mono">
              {trimmed.length}/{IMAGE_PROMPT_LIMITS.max}
            </span>
          </div>
        </div>

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
            <label htmlFor="img-model" className="text-xs text-text-secondary">
              Model
            </label>
            <select
              id="img-model"
              value={model}
              disabled={generating}
              onChange={(e) => {
                const next = e.target.value;
                setModel(next);
                // Switching to a smaller model must not leave a size it rejects.
                setSize((current) => coerceImageSize(next, current));
              }}
              className={selectClass}
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id} disabled={!m.available}>
                  {m.label} {m.available ? "" : "· soon"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="img-size" className="text-xs text-text-secondary">
              Size
            </label>
            <select
              id="img-size"
              value={size}
              disabled={generating}
              onChange={(e) => setSize(e.target.value)}
              className={selectClass}
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {formatImageSize(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="img-n" className="text-xs text-text-secondary">
              Images
            </label>
            <select
              id="img-n"
              value={n}
              disabled={generating}
              onChange={(e) => setN(Number(e.target.value))}
              className={selectClass}
            >
              {Array.from(
                { length: IMAGE_COUNT.max - IMAGE_COUNT.min + 1 },
                (_, i) => i + IMAGE_COUNT.min,
              ).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 border-t border-dashed border-border pt-4">
          <Button variant="primary" className="w-full" onClick={generate} disabled={!canGenerate}>
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate
              </>
            )}
          </Button>
          <p className="text-center text-xs text-text-tertiary">
            {!token ? "Connect your wallet to generate images" : quota ? quotaLabel(quota) : " "}
          </p>
        </div>
      </div>

      {/* ── Result display ─────────────────────────────────────── */}
      <div className="min-h-[320px] rounded-lg border border-border bg-bg-secondary p-4">
        {generating ? (
          <div className="flex h-full min-h-[288px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 size={22} className="animate-spin text-accent" />
            <p className="text-sm text-text-secondary">
              Generating…{" "}
              <span className="text-text-tertiary">(may take 15–30s if switching models)</span>
            </p>
          </div>
        ) : error ? (
          <ErrorView error={error} onRetry={generate} canRetry={canGenerate} />
        ) : result ? (
          <ResultView result={result} />
        ) : (
          <div className="flex h-full min-h-[288px] flex-col items-center justify-center gap-2 text-center">
            <ImageIcon size={22} className="text-text-muted" />
            <p className="text-sm text-text-tertiary">Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorView({
  error,
  onRetry,
  canRetry,
}: {
  error: Failure;
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

function ResultView({ result }: { result: Success }) {
  return (
    <div className="space-y-4">
      <div className={cn("grid gap-3", result.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
        {result.images.map((img, i) => (
          <figure key={img.url + i} className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={result.prompt}
              className="w-full rounded-md border border-border bg-bg-tertiary"
            />
            <Button variant="secondary" className="w-full" onClick={() => void download(img.url)}>
              <Download size={13} /> Download
            </Button>
          </figure>
        ))}
      </div>

      <dl className="space-y-1.5 border-t border-dashed border-border pt-3 text-xs">
        <Meta label="Prompt" value={result.prompt} />
        <Meta label="Size" value={formatImageSize(result.size)} />
        {result.images[0]?.seed != null && (
          <Meta label="Seed" value={String(result.images[0].seed)} />
        )}
        <Meta label="Generated in" value={`${(result.elapsedMs / 1000).toFixed(1)}s`} />
      </dl>

      <p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-2.5 text-[11px] text-text-secondary">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
        Images expire in 24 hours — download to keep a copy.
      </p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-text-secondary">{value}</dd>
    </div>
  );
}
