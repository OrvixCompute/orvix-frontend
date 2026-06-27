"use client";

import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/lib/store/hooks";
import { useGetBalanceQuery } from "@/lib/store/api/billingApi";
import { config } from "@/lib/constants/config";
import { formatDateTime } from "@/lib/utils/format";
import { truncateAddress } from "@/lib/utils/solana";

function InfoRow({
  label,
  value,
  mono = true,
  copy,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copy?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className={mono ? "truncate font-mono text-text-primary" : "text-text-primary"}>
          {value}
        </span>
        {copy && <CopyButton value={copy} className="shrink-0" />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const expiresAt = useAppSelector((s) => s.auth.expiresAt);
  const { data: balance } = useGetBalanceQuery();

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Manage your account and session." />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Account</h2>
        <Card className="divide-y divide-border p-0">
          <InfoRow
            label="Wallet"
            value={user ? truncateAddress(user.wallet, 6) : "—"}
            copy={user?.wallet}
          />
          <InfoRow
            label="Tier"
            mono={false}
            value={
              <Badge className="border-accent/30 text-text-primary">{balance?.tier ?? user?.tier ?? "—"}</Badge>
            }
          />
          <InfoRow label="USDC balance" value={balance ? `$${balance.balance_usdc}` : "—"} />
          <InfoRow
            label="Account ID"
            value={user ? truncateAddress(user.id, 6) : "—"}
            copy={user?.id}
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Session</h2>
        <Card className="divide-y divide-border p-0">
          <InfoRow label="Status" mono={false} value="Signed in" />
          <InfoRow
            label="Session expires"
            value={expiresAt ? formatDateTime(new Date(expiresAt).toISOString()) : "—"}
          />
        </Card>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={logout} className="text-danger hover:text-danger">
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary">Network</h2>
        <p className="text-xs text-text-tertiary">
          Read-only connection details for this deployment.
        </p>
        <Card className="divide-y divide-border p-0">
          <InfoRow label="API endpoint" value={config.apiUrl} copy={config.apiUrl} />
          <InfoRow label="Solana network" value={config.solanaNetwork} />
          <InfoRow
            label="USDC mint"
            value={truncateAddress(config.usdcMint, 6)}
            copy={config.usdcMint}
          />
        </Card>
      </section>
    </div>
  );
}
