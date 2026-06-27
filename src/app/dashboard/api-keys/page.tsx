"use client";

import { useState } from "react";
import { KeyRound, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { CreateKeyDialog } from "@/components/dashboard/apikeys/CreateKeyDialog";
import { RevealSecretDialog } from "@/components/dashboard/apikeys/RevealSecretDialog";
import { RevokeKeyDialog } from "@/components/dashboard/apikeys/RevokeKeyDialog";
import {
  useListKeysQuery,
  useRotateKeyMutation,
} from "@/lib/store/api/apiKeysApi";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ApiKeyInfo, CreateApiKeyResponse } from "@/lib/types/orvix";

export default function ApiKeysPage() {
  const { data: keys, isLoading, isError } = useListKeysQuery();
  const [rotateKey, { isLoading: rotating }] = useRotateKeyMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [secret, setSecret] = useState<CreateApiKeyResponse | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyInfo | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  const handleRotate = async (key: ApiKeyInfo) => {
    setRotatingId(key.id);
    try {
      const res = await rotateKey(key.id).unwrap();
      setSecret(res);
    } catch {
      /* surfaced by the list refetch staying unchanged */
    } finally {
      setRotatingId(null);
    }
  };

  const activeCount = keys?.filter((k) => k.is_active).length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="API keys"
        subtitle="Authenticate requests to the inference API. Treat keys like passwords."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Create key
          </Button>
        }
      />

      {isLoading ? (
        <Card className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </Card>
      ) : isError ? (
        <EmptyState icon={KeyRound} title="Couldn’t load your API keys" description="Please refresh and try again." />
      ) : !keys || keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create your first key to start making requests to the Orvix inference API."
        >
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Create key
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-text-muted">
            {activeCount} active · {keys.length} total
          </div>
          <Card className="divide-y divide-border p-0">
            {keys.map((key) => (
              <div
                key={key.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                  !key.is_active && "opacity-60",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-primary">{key.name}</span>
                    {key.is_active ? (
                      <Badge className="border-success/30 text-success">active</Badge>
                    ) : (
                      <Badge className="text-text-muted">revoked</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-text-tertiary">
                    {key.prefix}…
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-text-muted">
                  <div className="hidden sm:block">
                    <span className="text-text-tertiary">created </span>
                    {formatDateTime(key.created_at)}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-text-tertiary">last used </span>
                    {key.last_used_at ? formatDateTime(key.last_used_at) : "never"}
                  </div>

                  {key.is_active && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleRotate(key)}
                        disabled={rotating && rotatingId === key.id}
                        className="px-2 py-1"
                      >
                        <RefreshCw
                          size={13}
                          className={cn(rotating && rotatingId === key.id && "animate-spin")}
                        />
                        Rotate
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setRevokeTarget(key)}
                        className="px-2 py-1 text-danger hover:text-danger"
                      >
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      <CreateKeyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(res) => {
          setCreateOpen(false);
          setSecret(res);
        }}
      />
      <RevealSecretDialog secret={secret} onClose={() => setSecret(null)} />
      <RevokeKeyDialog target={revokeTarget} onClose={() => setRevokeTarget(null)} />
    </div>
  );
}
