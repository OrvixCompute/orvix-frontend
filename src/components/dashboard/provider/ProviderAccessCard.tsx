"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, RefreshCw, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { NodeSecretDialog } from "./NodeSecretDialog";
import {
  useRegisterProviderMutation,
  useRegenerateSecretMutation,
} from "@/lib/store/api/providerApi";
import { reportApiError, type ApiError } from "@/lib/utils/apiError";
import { routes } from "@/lib/constants/routes";
import type { ProviderSecret } from "@/lib/types/provider";

const INSTALL = `curl -sSL https://raw.githubusercontent.com/OrvixCompute/orvix/main/orvix-node/install.sh | bash`;

const DISPLAY_NAME_MAX = 80;

/**
 * Registration, secret rotation, and the three commands that take a machine
 * from nothing to serving jobs.
 *
 * `registered` is `is_provider` from GET /v1/auth/me. While it is still loading
 * the action is withheld rather than defaulted: guessing "not a provider" would
 * offer an existing provider a Become-a-provider button that silently rotates
 * their live secret, dropping a running node.
 */
export function ProviderAccessCard({
  registered,
  statusLoading = false,
}: {
  registered: boolean;
  statusLoading?: boolean;
}) {
  const [registerProvider, { isLoading: registering }] = useRegisterProviderMutation();
  const [regenerateSecret, { isLoading: regenerating }] = useRegenerateSecretMutation();

  const [secret, setSecret] = useState<ProviderSecret | null>(null);
  const [rotated, setRotated] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [rotateOpen, setRotateOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const register = async () => {
    setError(null);
    try {
      const name = displayName.trim();
      const res = await registerProvider(name ? { display_name: name } : {}).unwrap();
      setNameOpen(false);
      setDisplayName("");
      setRotated(false);
      setSecret(res);
    } catch (err) {
      setError(reportApiError("provider/register", err, "Could not register you as a provider."));
    }
  };

  const rotate = async () => {
    setError(null);
    try {
      const res = await regenerateSecret().unwrap();
      setRotateOpen(false);
      setRotated(true);
      setSecret(res);
    } catch (err) {
      setError(reportApiError("provider/regenerate-secret", err, "Could not issue a new secret."));
    }
  };

  // Only raised if the stake requirement is switched back on. Sending someone to
  // a blank failure when the fix is "go stake" would strand them.
  const stakeBlocked = error?.code === "insufficient_stake";
  const currentStake =
    typeof error?.details.current_stake === "string" ? error.details.current_stake : null;
  const requiredStake = typeof error?.details.required === "string" ? error.details.required : null;

  return (
    <>
      <Card className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-text-tertiary" />
              <h2 className="text-sm font-medium text-text-primary">
                {statusLoading
                  ? "Provider access"
                  : registered
                    ? "Node credentials"
                    : "Become a provider"}
              </h2>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {registered
                ? "Your node agent authenticates with a provider ID and a node secret. The secret is stored as a hash, so if you have lost it, issue a new one."
                : "Register this account as a provider to get the credentials your GPU machine needs. No stake is required during the alpha."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : registered ? (
              <Button onClick={() => setRotateOpen(true)} disabled={regenerating}>
                <RefreshCw size={14} className={regenerating ? "animate-spin" : undefined} />
                New secret
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setNameOpen(true)} disabled={registering}>
                <KeyRound size={14} /> Become a provider
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/5 p-3">
            <p className="text-xs text-text-secondary">{error.message}</p>
            {stakeBlocked && (
              <div className="mt-2 space-y-2">
                {currentStake && requiredStake && (
                  <p className="font-mono text-[11px] text-text-tertiary">
                    staked {currentStake} · required {requiredStake}
                  </p>
                )}
                <Link
                  href={routes.staking}
                  className="inline-flex items-center gap-1.5 text-xs text-text-primary transition-colors hover:text-accent-hover"
                >
                  Stake ORVX to qualify <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-text-muted">The whole path, three commands</div>
          <CodeBlock
            language="bash"
            code={`${INSTALL}
orvix-node join --provider-id … --node-secret …
orvix-node start`}
          />
          <p className="text-xs text-text-tertiary">
            The middle line comes back filled in when you{" "}
            {registered ? "issue a secret" : "register"}. Full setup notes live in the{" "}
            <Link href={routes.providers} className="text-text-secondary hover:text-text-primary">
              provider guide
            </Link>
            .
          </p>
        </div>
      </Card>

      {/* Optional label, asked for before registering rather than after, so the
          secret dialog that follows is the last thing standing between the
          provider and a running node. */}
      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Register as a provider">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="display-name" className="text-xs text-text-secondary">
              Display name <span className="text-text-muted">(optional)</span>
            </label>
            <Input
              id="display-name"
              placeholder="My Rig"
              maxLength={DISPLAY_NAME_MAX}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="text-[11px] text-text-muted">
              {displayName.length}/{DISPLAY_NAME_MAX}
            </p>
          </div>
          <p className="text-xs text-text-tertiary">
            Registration is free and takes effect immediately. You will get a node secret on the
            next screen — it is shown only once.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setNameOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={register} disabled={registering}>
              {registering ? "Registering…" : "Register"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={rotateOpen} onClose={() => setRotateOpen(false)} title="Issue a new node secret">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This replaces your current secret immediately. Any node still running on the old one
            keeps working until it next reconnects, then fails to authenticate and drops off the
            network.
          </p>
          <p className="text-sm text-text-secondary">
            To bring such a node back, run{" "}
            <span className="font-mono text-text-primary">orvix-node join --force</span> with the
            new credentials, then{" "}
            <span className="font-mono text-text-primary">orvix-node start</span>.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRotateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={rotate} disabled={regenerating}>
              {regenerating ? "Issuing…" : "Issue new secret"}
            </Button>
          </div>
        </div>
      </Modal>

      <NodeSecretDialog secret={secret} rotated={rotated} onClose={() => setSecret(null)} />
    </>
  );
}
