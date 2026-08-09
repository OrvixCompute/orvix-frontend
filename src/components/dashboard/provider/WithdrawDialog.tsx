"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWithdrawMutation } from "@/lib/store/api/providerApi";
import { reportApiError, type ApiError } from "@/lib/utils/apiError";
import { formatUsdcAmount, parseNumeric } from "@/lib/utils/format";
import { useAppSelector } from "@/lib/store/hooks";
import { truncateAddress } from "@/lib/utils/solana";

/** Server-side floor, mirrored here so the button can be disabled before the call. */
export const MIN_WITHDRAW_USDC = 1;

/**
 * Queue a payout. These settle on Solana and are real money, so the amount is
 * checked here as well as on the server — the submit button stays disabled
 * until the value parses, clears the 1 USDC floor, and fits inside
 * `available_to_withdraw`.
 *
 * Note `available` is NOT the account's `balance_usdc`. That balance is
 * topped-up spending money for buying inference and is never withdrawable;
 * offering it here would send people straight into a 402.
 */
export function WithdrawDialog({
  open,
  available,
  onClose,
  onRegisterNeeded,
}: {
  open: boolean;
  /** available_to_withdraw, as the API's string. */
  available: string | null | undefined;
  onClose: () => void;
  /** Called when the API says this account never registered as a provider. */
  onRegisterNeeded: () => void;
}) {
  const wallet = useAppSelector((s) => s.auth.user?.wallet ?? null);
  const [withdraw, { isLoading }] = useWithdrawMutation();

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  /**
   * Whether the payout was accepted. Deliberately not the response's
   * `estimated_completion`: that field is a fixed string the backend returns on
   * every request, not a figure computed for this one, so rendering it as
   * "settles in <value>" turns a constant into a per-payout promise.
   */
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setDestination("");
    setError(null);
    setQueued(false);
  }, [open]);

  const availableNum = parseNumeric(available) ?? 0;
  const parsed = /^\d*\.?\d+$/.test(amount.trim()) ? Number(amount.trim()) : null;

  let hint: string | null = null;
  if (amount.trim() && parsed === null) hint = "Enter a number.";
  else if (parsed !== null && parsed < MIN_WITHDRAW_USDC)
    hint = `The minimum withdrawal is ${MIN_WITHDRAW_USDC} USDC.`;
  else if (parsed !== null && parsed > availableNum)
    hint = `You have ${formatUsdcAmount(available)} USDC available.`;

  const canSubmit =
    parsed !== null && parsed >= MIN_WITHDRAW_USDC && parsed <= availableNum && !isLoading;

  const submit = async () => {
    if (!canSubmit || parsed === null) return;
    setError(null);
    try {
      const body = destination.trim()
        ? { amount: parsed, destination_wallet: destination.trim() }
        : { amount: parsed };
      await withdraw(body).unwrap();
      setQueued(true);
    } catch (err) {
      const parsedError = reportApiError("provider/withdraw", err, "Could not queue the payout.");
      setError(parsedError);
      if (parsedError.code === "not_a_provider") onRegisterNeeded();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Withdraw earnings" className="max-w-lg">
      {queued ? (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Payout queued. Withdrawals normally settle within the hour, though that is not
            guaranteed.
          </p>
          <p className="text-sm text-text-secondary">
            Watch your withdrawal history for the outcome either way: it shows the Solana
            transaction once the payout lands, or — if it does not go through — the reason, with the
            amount returned to your available balance.
          </p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-bg-tertiary px-3 py-2">
            <span className="text-xs text-text-muted">Available to withdraw</span>
            <span className="font-mono text-sm text-text-primary">
              {formatUsdcAmount(available)} USDC
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="withdraw-amount" className="text-xs text-text-secondary">
              Amount (USDC)
            </label>
            <div className="flex gap-2">
              <Input
                id="withdraw-amount"
                inputMode="decimal"
                placeholder={String(MIN_WITHDRAW_USDC)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button
                onClick={() => setAmount(String(availableNum))}
                disabled={availableNum <= 0}
                className="shrink-0"
              >
                Max
              </Button>
            </div>
            {hint && <p className="text-[11px] text-warning">{hint}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="withdraw-destination" className="text-xs text-text-secondary">
              Destination wallet <span className="text-text-muted">(optional)</span>
            </label>
            <Input
              id="withdraw-destination"
              placeholder={wallet ? truncateAddress(wallet) : "Your connected wallet"}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="font-mono"
            />
            <p className="text-[11px] text-text-muted">
              Leave blank to pay out to the wallet on this account.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs text-text-secondary">
              Payouts settle on Solana and cannot be reversed. Check the destination address before
              confirming.
            </p>
          </div>

          {error && (
            <div className="space-y-2 rounded-md border border-danger/30 bg-danger/5 p-3">
              <p className="text-xs text-text-secondary">{error.message}</p>
              {error.code === "not_a_provider" && (
                <Link
                  href="#provider-access"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs text-text-primary transition-colors hover:text-accent-hover"
                >
                  Register as a provider first <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={!canSubmit}>
              {isLoading ? "Queueing…" : "Withdraw"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
