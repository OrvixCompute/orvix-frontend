"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRevokeKeyMutation } from "@/lib/store/api/apiKeysApi";
import type { ApiKeyInfo } from "@/lib/types/orvix";

export function RevokeKeyDialog({
  target,
  onClose,
}: {
  target: ApiKeyInfo | null;
  onClose: () => void;
}) {
  const [revokeKey, { isLoading }] = useRevokeKeyMutation();

  const confirm = async () => {
    if (!target) return;
    try {
      await revokeKey(target.id).unwrap();
    } finally {
      onClose();
    }
  };

  return (
    <Modal open={target !== null} onClose={onClose} title="Revoke API key">
      {target && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Revoke <span className="text-text-primary">{target.name}</span> (
            <span className="font-mono text-xs">{target.prefix}…</span>)? Any application using
            this key will immediately stop working. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={confirm}
              disabled={isLoading}
              className="border-danger/40 text-danger hover:bg-danger/10"
            >
              {isLoading ? "Revoking…" : "Revoke key"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
