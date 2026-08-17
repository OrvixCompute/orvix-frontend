"use client";

import { useGetComputeStatsQuery } from "@/lib/store/api/networkApi";
import { useGetNetworkStatsQuery } from "@/lib/store/api/stakingApi";
import type { ComputeStats } from "@/lib/types/orvix";
import type { StatCardData } from "@/lib/types/stats";
import { ComputeHero } from "./ComputeHero";
import { StatSection } from "./StatSection";
import { EconomyCards } from "./EconomyCards";
import { NetworkStatusBar } from "./NetworkStatusBar";
import { StatsErrorNotice } from "./StatsErrorNotice";
import { formatNumber, parseNumeric, splitCompact } from "@/lib/utils/format";

/** The server caches /v1/network/stats for 30s, so poll at the same cadence. */
const POLL_MS = 30_000;

function plural(count: number, noun: string): string {
  return `${formatNumber(count)} ${noun}${count === 1 ? "" : "s"}`;
}

function formatVram(gb: number | null): string {
  if (gb === null) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(gb);
}

const LIVE_NETWORK_PLACEHOLDERS: StatCardData[] = [
  { label: "NODES ONLINE", value: "—", icon: "Server" },
  { label: "GPUS", value: "—", icon: "Cpu" },
  { label: "TOTAL VRAM", value: "—", icon: "MemoryStick" },
  { label: "PROVIDERS", value: "—", icon: "Users" },
];

const AI_ACTIVITY_PLACEHOLDERS: StatCardData[] = [
  { label: "CHAT REQUESTS", value: "—", icon: "MessageSquare" },
  { label: "IMAGES GENERATED", value: "—", icon: "Image" },
  { label: "VIDEOS GENERATED", value: "—", icon: "Video" },
  { label: "AVG RESPONSE TIME", value: "—", icon: "Clock" },
  { label: "MODELS SERVED", value: "—", icon: "Bot" },
];

function liveNetworkCards(stats: ComputeStats): StatCardData[] {
  const { nodes, gpus, providers } = stats;
  const gpuCount = gpus.reduce((total, gpu) => total + gpu.count, 0);

  return [
    {
      label: "NODES ONLINE",
      value: formatNumber(nodes.online),
      icon: "Server",
      sub: `${formatNumber(nodes.registered)} registered · ${formatNumber(nodes.ready)} ready · ${formatNumber(nodes.busy)} busy`,
    },
    {
      label: "GPUS",
      value: formatNumber(gpuCount),
      icon: "Cpu",
      sub: gpus.length
        ? gpus.map((gpu) => `${gpu.count}× ${gpu.gpu_model}`).join(" · ")
        : "No GPUs connected",
    },
    {
      label: "TOTAL VRAM",
      value: formatVram(parseNumeric(nodes.total_vram_gb)),
      unit: " GB",
      icon: "MemoryStick",
      sub: `${plural(nodes.chat_capable, "chat node")} · ${plural(nodes.image_capable, "image node")} · ${plural(nodes.video_capable, "video node")}`,
    },
    {
      label: "PROVIDERS",
      value: formatNumber(providers.total),
      icon: "Users",
      sub: `${formatNumber(providers.staked)} staked`,
    },
  ];
}

function aiActivityCards(stats: ComputeStats): StatCardData[] {
  const { chat, images, videos, models, window_hours: hours } = stats;
  const window = `in the last ${hours}h`;

  return [
    {
      label: "CHAT REQUESTS",
      value: formatNumber(chat.requests_total),
      icon: "MessageSquare",
      sub: `${formatNumber(chat.requests_window)} ${window}`,
    },
    {
      label: "IMAGES GENERATED",
      value: formatNumber(images.generated_total),
      icon: "Image",
      sub: `${formatNumber(images.generated_window)} ${window}`,
    },
    {
      label: "VIDEOS GENERATED",
      value: formatNumber(videos.generated_total),
      icon: "Video",
      sub: `${formatNumber(videos.generated_window)} ${window}`,
    },
    {
      label: "AVG RESPONSE TIME",
      value: chat.avg_latency_ms === null ? "—" : formatNumber(Math.round(chat.avg_latency_ms)),
      unit: chat.avg_latency_ms === null ? undefined : " ms",
      icon: "Clock",
      sub:
        chat.avg_latency_ms === null
          ? `No chat requests ${window}`
          : `Chat average ${window}`,
    },
    {
      label: "MODELS SERVED",
      value: formatNumber(models.chat + models.image + models.video),
      icon: "Bot",
      sub: `${formatNumber(models.chat)} chat · ${formatNumber(models.image)} image · ${formatNumber(models.video)} video`,
    },
  ];
}

export function StatsDashboard() {
  const compute = useGetComputeStatsQuery(undefined, { pollingInterval: POLL_MS });
  const economy = useGetNetworkStatsQuery();

  const stats = compute.data;
  // Only the very first load is a skeleton; polling refetches keep the old values.
  const computeLoading = !stats && compute.isFetching;
  const computeFailed = !stats && compute.isError;

  const tokens = splitCompact(stats?.chat.tokens_total);
  const tokensWindow = stats?.chat.tokens_window ?? 0;
  const idleNetwork = stats !== undefined && stats.nodes.registered === 0;

  const failures = [
    computeFailed ? "compute" : null,
    !economy.data && economy.isError ? "economy" : null,
  ].filter(Boolean);

  return (
    <>
      {failures.length > 0 && (
        <StatsErrorNotice
          message={`Could not load ${failures.join(" and ")} stats. The numbers below stay blank until the API responds.`}
          onRetry={() => {
            if (computeFailed) void compute.refetch();
            if (!economy.data && economy.isError) void economy.refetch();
          }}
        />
      )}

      <ComputeHero
        label="TOTAL TOKENS PROCESSED"
        value={stats ? tokens.value : "—"}
        unit={stats ? tokens.unit : ""}
        caption="TOKENS"
        highlight={stats && tokensWindow > 0 ? formatNumber(tokensWindow) : undefined}
        note={
          stats
            ? tokensWindow > 0
              ? `in the last ${stats.window_hours}h`
              : `No tokens processed in the last ${stats.window_hours}h`
            : "Waiting for network stats"
        }
        loading={computeLoading}
      />

      <StatSection
        title="LIVE NETWORK"
        stats={stats ? liveNetworkCards(stats) : LIVE_NETWORK_PLACEHOLDERS}
        columns={4}
        loading={computeLoading}
        note={idleNetwork ? "No providers have registered a node yet." : undefined}
      />

      <EconomyCards data={economy.data} loading={!economy.data && economy.isFetching} />

      <StatSection
        title="AI ACTIVITY"
        stats={stats ? aiActivityCards(stats) : AI_ACTIVITY_PLACEHOLDERS}
        columns={5}
        loading={computeLoading}
      />

      <NetworkStatusBar
        online={stats?.nodes.online}
        windowHours={stats?.window_hours}
        generatedAt={stats?.generated_at}
        loading={computeLoading}
      />
    </>
  );
}
