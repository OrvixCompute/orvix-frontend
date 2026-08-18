"use client";

import { useEffect, useState } from "react";
import { useGetComputeStatsQuery } from "@/lib/store/api/networkApi";
import type { ComputeStats } from "@/lib/types/orvix";

// Live network snapshot, polled from GET /v1/network/stats. The backend has
// no public event stream, so instead of faking per-job events we render the
// real aggregate state with a real timestamp — honest, and still "live".

const POLL_MS = 15_000;

const pad = (n: number) => String(n).padStart(2, "0");

function clock(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtVram(gb: string): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Number(gb));
}

/** Compact magnitude: 12,878 → "12.9k", 1,200,000 → "1.2M". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function linesFor(stats: ComputeStats): string[] {
  const { nodes, gpus, providers, chat, images, videos, models } = stats;
  const gpuCount = gpus.reduce((total, gpu) => total + gpu.count, 0);

  return [
    `snapshot    nodes=${nodes.online}/${nodes.registered} online  gpus=${gpuCount}  vram=${fmtVram(nodes.total_vram_gb)}GB`,
    `providers   total=${providers.total}  staked=${providers.staked}`,
    `chat        req=${fmt(chat.requests_total)}  tokens=${compact(chat.tokens_total)}  avg=${chat.avg_latency_ms === null ? "—" : `${Math.round(chat.avg_latency_ms)}ms`}`,
    `images      gen=${fmt(images.generated_total)}  (${fmt(images.generated_window)} last ${stats.window_hours}h)`,
    `videos      gen=${fmt(videos.generated_total)}  (${fmt(videos.generated_window)} last ${stats.window_hours}h)`,
    `models      chat ${models.chat_available}/${models.chat} · img ${models.image_available}/${models.image} · vid ${models.video_available}/${models.video}`,
  ];
}

export function NetworkFeed() {
  const { data } = useGetComputeStatsQuery(undefined, { pollingInterval: POLL_MS });
  const [now, setNow] = useState(() => clock());

  // Advance the clock every second so the feed visibly ticks.
  useEffect(() => {
    const id = window.setInterval(() => setNow(clock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lines = data ? linesFor(data) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
        <span className="font-mono text-xs text-text-muted">network stats · live</span>
        <span className="font-mono text-xs text-text-muted">· {now}</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-bg-secondary px-4 py-3 font-mono text-xs leading-6">
        <div className="whitespace-pre text-text-secondary">
          <span className="select-none text-text-muted">$ </span>
          orvix snapshot --live
        </div>
        {lines ? (
          lines.map((line, i) => (
            <div key={i} className="animate-fade-in whitespace-pre text-text-primary">
              {line}
            </div>
          ))
        ) : (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-bg-tertiary" />
            ))}
          </>
        )}
        <span className="inline-block animate-cursor-blink text-text-primary">▍</span>
      </div>
    </div>
  );
}
