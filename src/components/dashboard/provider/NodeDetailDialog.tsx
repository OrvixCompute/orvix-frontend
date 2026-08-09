"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DocsTable } from "@/components/docs/DocsTable";
import { NodeStatus, formatVram } from "./NodeStatus";
import { EarningsChart } from "./EarningsChart";
import { nodeLabel } from "./nodeLabel";
import { useGetNodeQuery } from "@/lib/store/api/providerApi";
import { formatDateTime, formatNumber, formatUsdcAmount } from "@/lib/utils/format";
import type { ProviderJob } from "@/lib/types/provider";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-text-muted">{label}</div>
      <div className="font-mono text-sm text-text-primary">{value}</div>
    </div>
  );
}

/**
 * Full detail for one node: live metrics when it is connected, its recent jobs,
 * and its own earnings history.
 */
export function NodeDetailDialog({
  nodeId,
  onClose,
}: {
  nodeId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useGetNodeQuery(nodeId as string, { skip: !nodeId });

  return (
    <Modal
      open={nodeId !== null}
      onClose={onClose}
      title={data ? nodeLabel(data) : "Node"}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-24" />
        </div>
      ) : isError || !data ? (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Could not load this node. It may have been removed.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <NodeStatus isConnected={data.is_connected} />
            <span className="font-mono text-xs text-text-tertiary">{data.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="GPU" value={data.gpu_model ?? "—"} />
            <Stat label="VRAM" value={formatVram(data.vram_mb) ?? "—"} />
            <Stat label="Jobs served" value={formatNumber(data.total_jobs)} />
            <Stat label="Reputation" value={String(data.reputation_score)} />
          </div>

          {/* Live metrics exist only while the WebSocket is up. */}
          {data.current_metrics ? (
            <div className="rounded-md border border-border bg-bg-tertiary p-3">
              <div className="text-[11px] text-text-muted">Live now</div>
              <div className="mt-2 flex flex-wrap gap-6">
                <Stat
                  label="Running jobs"
                  value={formatNumber(data.current_metrics.current_jobs)}
                />
                <Stat label="Agent status" value={data.current_metrics.status} />
              </div>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-text-tertiary">
              Live metrics appear while the node is connected. Start it with{" "}
              <span className="font-mono text-text-secondary">orvix-node start</span>.
            </p>
          )}

          {data.models_supported && data.models_supported.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-text-muted">Models served</div>
              <div className="flex flex-wrap gap-1.5">
                {data.models_supported.map((model) => (
                  <Badge key={model} className="font-mono">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <EarningsChart points={data.earnings_by_day} />

          <div className="space-y-2">
            <div className="text-[11px] text-text-muted">
              Recent jobs {data.recent_jobs.length > 0 && `· last ${data.recent_jobs.length}`}
            </div>
            {data.recent_jobs.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-tertiary">
                No jobs yet. Once this node is connected the orchestrator starts routing work to it.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <DocsTable
                  columns={[
                    { header: "model", cell: (j: ProviderJob) => j.model ?? "—", emphasis: true },
                    {
                      header: "tokens",
                      cell: (j: ProviderJob) => {
                        const t = (j.prompt_tokens ?? 0) + (j.completion_tokens ?? 0);
                        return t > 0 ? formatNumber(t) : "—";
                      },
                    },
                    {
                      header: "earned",
                      cell: (j: ProviderJob) => formatUsdcAmount(j.provider_earning_usdc),
                    },
                    { header: "status", cell: (j: ProviderJob) => j.status ?? "—" },
                    { header: "when", cell: (j: ProviderJob) => formatDateTime(j.created_at) },
                  ]}
                  rows={data.recent_jobs}
                  rowKey={(j) => j.id}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
