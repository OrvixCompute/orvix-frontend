"use client";

import { Bell, Menu } from "lucide-react";
import { useGetBalanceQuery } from "@/lib/store/api/billingApi";
import { useAuth } from "@/hooks/useAuth";
import { ConnectButton } from "@/components/wallet/ConnectButton";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { isAuthenticated } = useAuth();
  const { data: balance } = useGetBalanceQuery(undefined, { skip: !isAuthenticated });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-primary px-4 md:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="text-text-secondary hover:text-text-primary md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex flex-1 items-center justify-end gap-4">
        <span className="hidden font-mono text-sm text-text-secondary sm:inline">
          <span className="text-text-muted">balance </span>
          {balance ? `$${balance.balance_usdc}` : "—"}
          <span className="ml-1 text-text-muted">USDC</span>
        </span>
        <button
          aria-label="Notifications"
          className="text-text-tertiary transition-colors hover:text-text-secondary"
        >
          <Bell size={16} />
        </button>
        <ConnectButton />
      </div>
    </header>
  );
}
