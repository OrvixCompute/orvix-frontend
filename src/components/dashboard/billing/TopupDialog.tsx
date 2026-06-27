"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { QrCode } from "@/components/ui/QrCode";
import { useCreateTopupIntentMutation } from "@/lib/store/api/billingApi";
import { formatDateTime } from "@/lib/utils/format";
import { truncateAddress } from "@/lib/utils/solana";
import type { TopupIntentResponse } from "@/lib/types/orvix";

const schema = z.object({
  amount: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (/^\d*\.?\d+$/.test(v) && Number(v) > 0), "Enter a valid amount"),
});
type FormValues = z.infer<typeof schema>;

/** A labelled value row with a copy button — for the treasury address and memo. */
function CopyRow({ label, value, display }: { label: string; value: string; display?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-tertiary px-3 py-2">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-text-primary">
          {display ?? value}
        </code>
        <CopyButton value={value} className="shrink-0" />
      </div>
    </div>
  );
}

export function TopupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createIntent, { isLoading }] = useCreateTopupIntentMutation();
  const [intent, setIntent] = useState<TopupIntentResponse | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { amount: "" } });

  const close = () => {
    reset();
    setIntent(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await createIntent({
        expected_amount: values.amount ? values.amount : null,
      }).unwrap();
      setIntent(res);
    } catch {
      setError("amount", { message: "Could not start the top-up. Please try again." });
    }
  };

  return (
    <Modal open={open} onClose={close} title="Top up USDC" className="max-w-lg">
      {!intent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Generate a deposit address and a unique memo. Send USDC on Solana with that memo
            attached and your balance is credited automatically once the transfer confirms.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="topup-amount" className="text-sm text-text-secondary">
              Amount <span className="text-text-muted">(optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-muted">
                $
              </span>
              <Input
                id="topup-amount"
                inputMode="decimal"
                placeholder="0.00"
                className="pl-7 font-mono"
                autoFocus
                {...register("amount")}
              />
            </div>
            {errors.amount ? (
              <p className="text-xs text-danger">{errors.amount.message}</p>
            ) : (
              <p className="text-xs text-text-tertiary">
                Leave blank to send any amount. USDC only.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Generating…" : "Generate address"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <QrCode value={intent.qr_data} size={200} />
          </div>

          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs text-text-secondary">
              You must include the memo below in your transfer. Without it, the deposit cannot be
              matched to your account.
            </p>
          </div>

          <CopyRow
            label="Treasury address"
            value={intent.treasury_address}
            display={truncateAddress(intent.treasury_address, 8)}
          />
          <CopyRow label="Memo (required)" value={intent.memo} />

          <div className="flex justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="text-text-muted">Expected amount</div>
              <div className="font-mono text-text-primary">
                {intent.expected_amount ? `$${intent.expected_amount}` : "any"}
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-text-muted">Expires</div>
              <div className="font-mono text-text-primary">{formatDateTime(intent.expires_at)}</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
