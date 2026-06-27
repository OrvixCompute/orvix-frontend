"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useGetBalanceQuery, useGetTransactionsQuery } from "@/lib/store/api/billingApi";
import { useListKeysQuery } from "@/lib/store/api/apiKeysApi";
import { dashboardRoutes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

// A transaction counts as a "first request" if it's an inference/usage charge
// (not a top-up). Unknown types leave the step unchecked rather than over-claim.
const REQUEST_TYPE = /usage|inference|chat|completion|charge|request|job/i;

/**
 * Onboarding checklist shown on the overview until the user has topped up,
 * created a key, and made a request. Hides itself once all three are done.
 */
export function GetStarted() {
  const { data: balance, isLoading: balanceLoading } = useGetBalanceQuery();
  const { data: keys, isLoading: keysLoading } = useListKeysQuery();
  const { data: txns, isLoading: txnsLoading } = useGetTransactionsQuery({ limit: 50 });

  // Avoid a flash of the panel before we know the real state.
  if (balanceLoading || keysLoading || txnsLoading) return null;

  const steps = [
    {
      done: !!balance && Number(balance.balance_usdc) > 0,
      label: "Top up USDC",
      hint: "Add a balance to pay for inference.",
      href: dashboardRoutes.billing,
      cta: "Top up",
    },
    {
      done: !!keys && keys.length > 0,
      label: "Create an API key",
      hint: "Authenticate your requests.",
      href: dashboardRoutes.apiKeys,
      cta: "Create key",
    },
    {
      done: !!txns && txns.some((t) => REQUEST_TYPE.test(t.type)),
      label: "Make your first request",
      hint: "Run a prompt in the playground or via the API.",
      href: dashboardRoutes.playground,
      cta: "Open playground",
    },
  ];

  if (steps.every((s) => s.done)) return null;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-text-primary">Get started</h2>
        <p className="mt-0.5 text-xs text-text-tertiary">
          Three steps to your first inference request.
        </p>
      </div>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                s.done ? "border-success/40 text-success" : "border-border text-text-muted",
              )}
            >
              {s.done ? <Check size={12} /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span className={cn("text-sm", s.done ? "text-text-tertiary line-through" : "text-text-primary")}>
                {s.label}
              </span>
              {!s.done && (
                <span className="ml-2 hidden text-xs text-text-tertiary sm:inline">{s.hint}</span>
              )}
            </div>
            {!s.done && (
              <Link
                href={s.href}
                className="shrink-0 text-xs text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary"
              >
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
