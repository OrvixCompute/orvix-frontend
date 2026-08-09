"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { EarningsChart } from "./EarningsChart";
import { WithdrawDialog, MIN_WITHDRAW_USDC } from "./WithdrawDialog";
import { WithdrawalsTable } from "./WithdrawalsTable";
import { useGetEarningsQuery } from "@/lib/store/api/providerApi";
import { formatDateTime, formatUsdcAmount, parseNumeric } from "@/lib/utils/format";
import type { ProviderEarnings } from "@/lib/types/provider";

/**
 * Earnings, the payout button, and history.
 *
 * The withdrawable figure is `available_to_withdraw` — credited from completed
 * jobs. It is deliberately not the user's `balance_usdc`, which is topped-up
 * spending money for buying inference and cannot be paid out.
 */
export function EarningsPanel({ onRegisterNeeded }: { onRegisterNeeded: () => void }) {
  const { data, isLoading, isError } = useGetEarningsQuery();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const earnings: ProviderEarnings | undefined = data;
  const available = parseNumeric(earnings?.available_to_withdraw) ?? 0;
  const pending = parseNumeric(earnings?.pending_withdrawal) ?? 0;
  const canWithdraw = available >= MIN_WITHDRAW_USDC;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-text-primary">Earnings</h2>
        <Button
          variant="primary"
          onClick={() => setWithdrawOpen(true)}
          disabled={!canWithdraw}
          title={
            canWithdraw
              ? undefined
              : `You need at least ${MIN_WITHDRAW_USDC} USDC available to withdraw`
          }
        >
          Withdraw
        </Button>
      </div>

      {isError ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-tertiary">
          Couldn’t load your earnings. Refresh to try again.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Available to withdraw"
              value={`${formatUsdcAmount(earnings?.available_to_withdraw)} USDC`}
              hint="Credited from completed jobs"
              loading={isLoading}
            />
            <StatCard
              label="Lifetime earned"
              value={`${formatUsdcAmount(earnings?.total_lifetime_usdc)} USDC`}
              hint={
                earnings?.last_payout_at
                  ? `Last payout ${formatDateTime(earnings.last_payout_at)}`
                  : "No payout yet"
              }
              loading={isLoading}
            />
            <StatCard
              label="Pending withdrawal"
              value={`${formatUsdcAmount(earnings?.pending_withdrawal)} USDC`}
              hint={pending > 0 ? "Queued for settlement" : "Nothing in flight"}
              loading={isLoading}
            />
          </div>

          <Card>
            <EarningsChart points={earnings?.earnings_by_day} />
          </Card>

          {!canWithdraw && available > 0 && (
            <p className="text-xs text-text-tertiary">
              You have {formatUsdcAmount(earnings?.available_to_withdraw)} USDC. Payouts start at{" "}
              {MIN_WITHDRAW_USDC} USDC — earnings keep accruing until you reach it.
            </p>
          )}

          <div className="space-y-2 pt-2">
            <h3 className="text-xs text-text-muted">Withdrawal history</h3>
            <WithdrawalsTable />
          </div>
        </>
      )}

      <WithdrawDialog
        open={withdrawOpen}
        available={earnings?.available_to_withdraw}
        onClose={() => setWithdrawOpen(false)}
        onRegisterNeeded={onRegisterNeeded}
      />
    </section>
  );
}
