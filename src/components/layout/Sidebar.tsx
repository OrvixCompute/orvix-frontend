"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  CreditCard,
  Terminal as TerminalIcon,
  Coins,
  Vote,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { dashboardRoutes, routes } from "@/lib/constants/routes";
import { truncateAddress } from "@/lib/utils/solana";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: "Overview", href: dashboardRoutes.overview, icon: LayoutDashboard },
  { label: "API keys", href: dashboardRoutes.apiKeys, icon: KeyRound },
  { label: "Billing", href: dashboardRoutes.billing, icon: CreditCard },
  { label: "Playground", href: dashboardRoutes.playground, icon: TerminalIcon },
  { label: "Staking", href: dashboardRoutes.staking, icon: Coins },
  { label: "Governance", href: dashboardRoutes.governance, icon: Vote },
  { label: "Settings", href: dashboardRoutes.settings, icon: SettingsIcon },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="flex h-full flex-col">
      <Link
        href={routes.home}
        className="px-4 py-5 text-base font-medium tracking-tight text-text-primary"
      >
        orvix
      </Link>

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map((item) => {
          // Overview is an exact match; the rest match their subtree.
          const active =
            item.href === dashboardRoutes.overview
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-bg-secondary text-text-primary"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
              )}
              <Icon size={16} className={active ? "text-text-primary" : "text-text-tertiary"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="m-2 rounded-md border border-border p-3">
          <div className="font-mono text-xs text-text-secondary">
            {truncateAddress(user.wallet)}
          </div>
          <Badge className="mt-2 capitalize">{user.tier} tier</Badge>
        </div>
      )}
    </div>
  );
}
