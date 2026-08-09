"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRenameNodeMutation } from "@/lib/store/api/providerApi";
import { reportApiError } from "@/lib/utils/apiError";
import type { ProviderNode } from "@/lib/types/provider";

/** Matches the backend's RenameNodeRequest (1–50 chars). */
const NAME_MAX = 50;

export function RenameNodeDialog({
  node,
  onClose,
}: {
  node: ProviderNode | null;
  onClose: () => void;
}) {
  const [renameNode, { isLoading }] = useRenameNodeMutation();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(node?.name ?? "");
    setError(null);
  }, [node]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= NAME_MAX && !isLoading;

  const save = async () => {
    if (!node || !canSave) return;
    setError(null);
    try {
      await renameNode({ nodeId: node.id, name: trimmed }).unwrap();
      onClose();
    } catch (err) {
      setError(reportApiError("provider/rename-node", err, "Could not rename this node.").message);
    }
  };

  return (
    <Modal open={node !== null} onClose={onClose} title="Rename node">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="node-name" className="text-xs text-text-secondary">
            Name
          </label>
          <Input
            id="node-name"
            value={name}
            maxLength={NAME_MAX}
            placeholder={node?.gpu_model ?? "Workstation"}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
            }}
          />
          <p className="text-[11px] text-text-muted">
            {trimmed.length}/{NAME_MAX} · a label for you, not visible to callers
          </p>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
