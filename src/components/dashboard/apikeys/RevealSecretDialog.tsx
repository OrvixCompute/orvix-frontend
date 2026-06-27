"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import type { CreateApiKeyResponse } from "@/lib/types/orvix";

/**
 * Shows a freshly created/rotated key's full secret. Non-dismissible by
 * backdrop/escape — the user must acknowledge, since the secret is shown once.
 */
export function RevealSecretDialog({
  secret,
  onClose,
}: {
  secret: CreateApiKeyResponse | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={secret !== null}
      onClose={onClose}
      title="Save your API key"
      dismissible={false}
    >
      {secret && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs text-text-secondary">
              This is the only time the full key for{" "}
              <span className="text-text-primary">{secret.name}</span> will be shown. Copy it now
              and store it somewhere safe.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-tertiary px-3 py-2.5">
            <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-text-primary">
              {secret.key}
            </code>
            <CopyButton value={secret.key} label="copy" className="shrink-0" />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
