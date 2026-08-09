"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ProviderSecret } from "@/lib/types/provider";

/** The command a provider runs to attach their machine to this account. */
export function joinCommand(secret: ProviderSecret): string {
  return `orvix-node join --provider-id ${secret.provider_id} --node-secret ${secret.node_secret}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-tertiary px-3 py-2">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-text-primary">
          {value}
        </code>
        <CopyButton value={value} className="shrink-0" />
      </div>
    </div>
  );
}

/**
 * Shows a freshly issued node secret. Not dismissible by backdrop or escape:
 * the secret exists in readable form exactly once, and the server keeps only a
 * hash of it, so a click outside the dialog would destroy it.
 *
 * The headline is the assembled `join` command rather than the two raw values.
 * Both are flags on that command, so a provider who copies the line answers no
 * prompts and never has to work out which identifier is theirs.
 */
export function NodeSecretDialog({
  secret,
  rotated = false,
  onClose,
}: {
  secret: ProviderSecret | null;
  /** True when this replaced an existing secret, which changes what to warn about. */
  rotated?: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={secret !== null}
      onClose={onClose}
      title={rotated ? "Your new node secret" : "Connect your machine"}
      dismissible={false}
      className="max-w-xl"
    >
      {secret && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs text-text-secondary">
              This secret is shown <span className="text-text-primary">once</span>. Orvix stores
              only a hash of it, so it cannot be looked up later — a lost secret is replaced, never
              recovered. Copy the command below before closing.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-text-muted">Run this on your GPU machine</div>
            <div className="flex items-start justify-between gap-3 rounded-md border border-accent/30 bg-bg-tertiary px-3 py-2.5">
              <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-text-primary">
                {joinCommand(secret)}
              </code>
              <CopyButton value={joinCommand(secret)} label="copy" className="shrink-0" />
            </div>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs text-text-tertiary transition-colors hover:text-text-secondary">
              Show the values separately
            </summary>
            <div className="mt-3 space-y-3">
              <Field label="Provider ID" value={secret.provider_id} />
              <Field label="Node secret" value={secret.node_secret} />
            </div>
          </details>

          {rotated && (
            <p className="text-xs text-text-tertiary">
              The previous secret stopped working the moment this one was issued. Any node still
              running on it drops at its next reconnect — re-attach it with{" "}
              <span className="font-mono text-text-secondary">orvix-node join --force</span>.
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              I&apos;ve copied it
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
