"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
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

function JobRow({ job }: { job: ProviderJob }) {
  const tokens = (job.prompt_tokens ?? 0) + (job.completion_tokens ?? 0);
  return (
    <tr className="border-t border-border text-text-secondary">
      <td className="py-2 pr-4 text-text-primary">{job.model ?? "—"}</td>
      <td className="py-2 pr-4">{tokens > 0 ? formatNumber(tokens) : "—"}</td>
      <td className="py-2 pr-4 text-text-primary">{formatUsdcAmount(job.provider_earning_usdc)}</td>
      <td className="py-2 pr-4">{job.status ?? "—"}</td>
      <td className="py-2 text-right">{formatDateTime(job.created_at)}</td>
    </tr>
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
              <div className="max-h-64 overflow-auto">
                <table className="w-full font-mono text-xs">
                  <thead className="sticky top-0 bg-bg-secondary">
                    <tr className="text-text-muted">
                      <th className="py-2 pr-4 text-left font-normal">model</th>
                      <th className="py-2 pr-4 text-left font-normal">tokens</th>
                      <th className="py-2 pr-4 text-left font-normal">earned</th>
                      <th className="py-2 pr-4 text-left font-normal">status</th>
                      <th className="py-2 text-right font-normal">when</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_jobs.map((job) => (
                      <JobRow key={job.id} job={job} />
                    ))}
                  </tbody>
                </table>
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
