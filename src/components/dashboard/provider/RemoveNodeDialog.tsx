"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDeleteNodeMutation } from "@/lib/store/api/providerApi";
import { reportApiError } from "@/lib/utils/apiError";
import { nodeLabel } from "./nodeLabel";
import type { ProviderNode } from "@/lib/types/provider";

/**
 * Confirmation for DELETE /v1/provider/nodes/{id}. The call marks the node
 * offline and asks the agent to shut down, so it stops earning — worth a
 * deliberate confirmation rather than an inline button.
 */
export function RemoveNodeDialog({
  node,
  onClose,
}: {
  node: ProviderNode | null;
  onClose: () => void;
}) {
  const [deleteNode, { isLoading }] = useDeleteNodeMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setError(null), [node]);

  const remove = async () => {
    if (!node) return;
    setError(null);
    try {
      await deleteNode(node.id).unwrap();
      onClose();
    } catch (err) {
      setError(reportApiError("provider/delete-node", err, "Could not remove this node.").message);
    }
  };

  return (
    <Modal open={node !== null} onClose={onClose} title="Remove node">
      {node && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
            <p className="text-xs text-text-secondary">
              <span className="text-text-primary">{nodeLabel(node)}</span> will be marked offline
              and asked to shut down. It stops receiving jobs and stops earning.
            </p>
          </div>

          <p className="text-sm text-text-secondary">
            Earnings already credited are unaffected and stay withdrawable. To bring the machine
            back later, run <span className="font-mono text-text-primary">orvix-node start</span>{" "}
            again — it re-registers with the same credentials.
          </p>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={remove}
              disabled={isLoading}
              className="bg-danger hover:bg-danger/90"
            >
              {isLoading ? "Removing…" : "Remove node"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
