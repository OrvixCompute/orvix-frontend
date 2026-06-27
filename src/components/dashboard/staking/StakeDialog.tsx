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
import { useCreateStakeIntentMutation } from "@/lib/store/api/stakingApi";
import { formatDateTime } from "@/lib/utils/format";
import { truncateAddress } from "@/lib/utils/solana";
import type { StakeIntentResponse } from "@/lib/types/orvix";

const schema = z.object({
  amount: z
    .string()
    .trim()
    .refine((v) => /^\d*\.?\d+$/.test(v) && Number(v) > 0, "Enter a valid ORVX amount"),
});
type FormValues = z.infer<typeof schema>;

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

export function StakeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createIntent, { isLoading }] = useCreateStakeIntentMutation();
  const [intent, setIntent] = useState<StakeIntentResponse | null>(null);
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
      const res = await createIntent({ amount: values.amount }).unwrap();
      setIntent(res);
    } catch {
      setError("amount", { message: "Could not start staking. Please try again." });
    }
  };

  return (
    <Modal open={open} onClose={close} title="Stake ORVX" className="max-w-lg">
      {!intent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Staking ORVX raises your tier, lowers inference fees, and grants voting power. Enter an
            amount to generate a deposit address and memo.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="stake-amount" className="text-sm text-text-secondary">
              Amount (ORVX)
            </label>
            <Input
              id="stake-amount"
              inputMode="decimal"
              placeholder="0"
              className="font-mono"
              autoFocus
              {...register("amount")}
            />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
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
              Send exactly <span className="font-mono text-text-primary">{intent.amount} ORVX</span>{" "}
              with the memo below. The transfer must include the memo to be credited to your stake.
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
              <div className="text-text-muted">Amount</div>
              <div className="font-mono text-text-primary">{intent.amount} ORVX</div>
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
