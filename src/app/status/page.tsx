"use client";

import { useGetComputeStatsQuery } from "@/lib/store/api/networkApi";
import { PublicShell, PageIntro } from "@/components/layout/PublicShell";
import { cn } from "@/lib/utils/cn";

type ComponentStatus = "operational" | "degraded" | "offline" | "loading";

interface Component {
  name: string;
  status: ComponentStatus;
  detail?: string;
}

// The server caches /v1/network/stats for 30s, so poll at the same cadence.
const POLL_MS = 30_000;

function deriveComponents(
  online: number | undefined,
  registered: number | undefined,
  loaded: boolean,
): Component[] {
  if (!loaded) {
    return [
      { name: "Orchestrator API", status: "loading" },
      { name: "Inference network", status: "loading" },
      { name: "Billing & settlement", status: "loading" },
      { name: "Dashboard", status: "loading" },
    ];
  }

  const inference: Component =
    online !== undefined && online > 0
      ? {
          name: "Inference network",
          status: "operational",
          detail: `${online} node${online === 1 ? "" : "s"} online`,
        }
      : registered === 0
        ? { name: "Inference network", status: "offline", detail: "No providers registered yet" }
        : { name: "Inference network", status: "degraded", detail: "No nodes currently online" };

  return [
    // The API responded, so the orchestrator and the dashboard that serves it
    // are reachable.
    { name: "Orchestrator API", status: "operational", detail: "Responding to requests" },
    inference,
    { name: "Billing & settlement", status: "operational", detail: "Settlement on-chain" },
    { name: "Dashboard", status: "operational", detail: "Serving this page" },
  ];
}

const STATUS_STYLES: Record<ComponentStatus, { dot: string; label: string }> = {
  operational: { dot: "bg-success", label: "text-text-secondary" },
  degraded: { dot: "bg-warning", label: "text-text-secondary" },
  offline: { dot: "bg-danger", label: "text-text-secondary" },
  loading: { dot: "animate-pulse bg-border-strong", label: "text-text-muted" },
};

export default function StatusPage() {
  const { data, isError, isLoading, refetch, isFetching } = useGetComputeStatsQuery(undefined, {
    pollingInterval: POLL_MS,
  });

  const components = isError
    ? [
        {
          name: "Orchestrator API",
          status: "offline" as const,
          detail: "Could not reach the network API",
        },
      ]
    : deriveComponents(data?.nodes.online, data?.nodes.registered, !isLoading);

  return (
    <PublicShell>
      <PageIntro
        eyebrow="status"
        title="System status"
        lead="Current operational status of Orvix components, derived from live network statistics."
      />

      {isError && (
        <div className="mb-6 rounded-lg border border-border bg-bg-secondary p-4 text-sm text-text-secondary">
          <p>
            We could not reach the Orvix API. The status below reflects the last successful check.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 text-text-primary underline-offset-4 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="divide-y divide-border rounded-lg border border-border bg-bg-secondary p-0">
        {components.map((c) => {
          const style = STATUS_STYLES[c.status];
          return (
            <div
              key={c.name}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-text-primary">{c.name}</span>
              <span className="flex items-center gap-2">
                {c.detail && (
                  <span className="hidden text-xs text-text-muted sm:inline">{c.detail}</span>
                )}
                <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                <span className={`font-mono text-xs capitalize ${style.label}`}>
                  {c.status}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-text-muted">
        {isFetching && !isLoading ? "Refreshing…" : `Updated from /v1/network/stats every ${POLL_MS / 1000}s`}
      </p>
    </PublicShell>
  );
}
