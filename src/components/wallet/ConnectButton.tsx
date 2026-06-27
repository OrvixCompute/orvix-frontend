"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { truncateAddress } from "@/lib/utils/solana";
import { dashboardRoutes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

/**
 * Wallet/auth control with three states:
 *  - not connected      -> "connect wallet" (opens adapter modal)
 *  - connected, no JWT  -> "sign in" (challenge → sign → verify)
 *  - authenticated      -> address + dropdown (account / settings / sign out)
 */
export function ConnectButton({ className }: { className?: string }) {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, isLoading, error, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const base = cn(
    "inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5",
    "text-sm font-mono text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary",
  );

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  // --- not connected ---
  if (!connected || !publicKey) {
    return (
      <button className={cn(base, className)} onClick={() => setVisible(true)}>
        connect wallet
      </button>
    );
  }

  // --- connected, not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className={cn("flex flex-col items-end gap-1", className)}>
        <button className={base} onClick={() => login()} disabled={isLoading}>
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? "signing…" : "sign in"}
        </button>
        {error && <span className="max-w-[14rem] text-right text-xs text-danger">{error}</span>}
      </div>
    );
  }

  // --- authenticated ---
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button className={base} onClick={() => setMenuOpen((v) => !v)}>
        {truncateAddress(publicKey.toBase58())}
        <ChevronDown size={14} className={cn("transition-transform", menuOpen && "rotate-180")} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-border bg-bg-secondary py-1 text-sm">
          <Link
            href={dashboardRoutes.overview}
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            My account
          </Link>
          <Link
            href={dashboardRoutes.settings}
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full px-3 py-2 text-left text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
