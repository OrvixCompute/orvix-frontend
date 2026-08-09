"use client";

import { useState } from "react";
import { MoreHorizontal, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NodeStatus, formatVram } from "./NodeStatus";
import { NodeDetailDialog } from "./NodeDetailDialog";
import { RenameNodeDialog } from "./RenameNodeDialog";
import { RemoveNodeDialog } from "./RemoveNodeDialog";
import { nodeLabel } from "./nodeLabel";
import { useListNodesQuery } from "@/lib/store/api/providerApi";
import { formatNumber, formatUsdcAmount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ProviderNode } from "@/lib/types/provider";

function NodeRow({
  node,
  onOpen,
  onRename,
  onRemove,
}: {
  node: ProviderNode;
  onOpen: () => void;
  onRename: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const vram = formatVram(node.vram_mb);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
        !node.is_connected && "opacity-75",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpen}
            className="text-sm text-text-primary transition-colors hover:text-accent-hover"
          >
            {nodeLabel(node)}
          </button>
          <NodeStatus isConnected={node.is_connected} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-text-tertiary">
          {node.gpu_model && <span>{node.gpu_model}</span>}
          {vram && <span>{vram}</span>}
          {node.models_supported && node.models_supported.length > 0 && (
            <span>{node.models_supported.length} models</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-text-muted">
        <div className="hidden sm:block">
          <span className="text-text-tertiary">jobs </span>
          {formatNumber(node.total_jobs)}
        </div>
        <div>
          <span className="text-text-tertiary">earned </span>
          <span className="font-mono text-text-primary">
            {formatUsdcAmount(node.total_earned_usdc)}
          </span>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            aria-label={`Actions for ${nodeLabel(node)}`}
            onClick={() => setMenuOpen((open) => !open)}
            className="px-2 py-1"
          >
            <MoreHorizontal size={14} />
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-md border border-border bg-bg-secondary py-1 shadow-xl">
                {[
                  { label: "View details", action: onOpen },
                  { label: "Rename", action: onRename },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      item.action();
                    }}
                    className="block w-full px-3 py-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-danger transition-colors hover:bg-bg-tertiary"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The provider's machines. Liveness comes from is_connected, never last_heartbeat. */
export function NodesPanel({ registered }: { registered: boolean }) {
  const { data: nodes, isLoading, isError } = useListNodesQuery();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ProviderNode | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ProviderNode | null>(null);

  const connected = nodes?.filter((node) => node.is_connected).length ?? 0;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-text-primary">Nodes</h2>
        {nodes && nodes.length > 0 && (
          <span className="font-mono text-xs text-text-muted">
            {connected} connected · {nodes.length} registered
          </span>
        )}
      </div>

      {isLoading ? (
        <Card className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </Card>
      ) : isError ? (
        <EmptyState
          icon={Server}
          title="Couldn’t load your nodes"
          description="Please refresh and try again."
        />
      ) : !nodes || nodes.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No nodes connected yet"
          description={
            registered
              ? "Run the join command on your GPU machine, then orvix-node start. It appears here within a few seconds of connecting."
              : "Register as a provider above to get the credentials your machine needs, then run the three commands."
          }
        >
          <Badge className="font-mono">orvix-node start</Badge>
        </EmptyState>
      ) : (
        <Card className="divide-y divide-border p-0">
          {nodes.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              onOpen={() => setDetailId(node.id)}
              onRename={() => setRenameTarget(node)}
              onRemove={() => setRemoveTarget(node)}
            />
          ))}
        </Card>
      )}

      <NodeDetailDialog nodeId={detailId} onClose={() => setDetailId(null)} />
      <RenameNodeDialog node={renameTarget} onClose={() => setRenameTarget(null)} />
      <RemoveNodeDialog node={removeTarget} onClose={() => setRemoveTarget(null)} />
    </section>
  );
}
