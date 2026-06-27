"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useUnstakeMutation } from "@/lib/store/api/stakingApi";
import type { UnstakeResponse } from "@/lib/types/orvix";

const schema = z.object({
  amount: z
    .string()
    .trim()
    .refine((v) => /^\d*\.?\d+$/.test(v) && Number(v) > 0, "Enter a valid ORVX amount"),
  destination: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (v.length >= 32 && v.length <= 44), "Enter a valid Solana address"),
});
type FormValues = z.infer<typeof schema>;

export function UnstakeDialog({
  open,
  onClose,
  staked,
}: {
  open: boolean;
  onClose: () => void;
  staked: string;
}) {
  const [unstake, { isLoading }] = useUnstakeMutation();
  const [result, setResult] = useState<UnstakeResponse | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", destination: "" },
  });

  const close = () => {
    reset();
    setResult(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (Number(values.amount) > Number(staked)) {
      setError("amount", { message: `You only have ${staked} ORVX staked` });
      return;
    }
    try {
      const res = await unstake({
        amount: values.amount,
        destination_wallet: values.destination ? values.destination : null,
      }).unwrap();
      setResult(res);
    } catch {
      setError("amount", { message: "Could not unstake. Tokens may still be locked." });
    }
  };

  return (
    <Modal open={open} onClose={close} title="Unstake ORVX" className="max-w-lg">
      {!result ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Withdraw staked ORVX. Lowering your stake may drop your tier and fee discount. You have{" "}
            <span className="font-mono text-text-primary">{staked} ORVX</span> staked.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="unstake-amount" className="text-sm text-text-secondary">
              Amount (ORVX)
            </label>
            <Input
              id="unstake-amount"
              inputMode="decimal"
              placeholder="0"
              className="font-mono"
              autoFocus
              {...register("amount")}
            />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="unstake-dest" className="text-sm text-text-secondary">
              Destination wallet <span className="text-text-muted">(optional)</span>
            </label>
            <Input
              id="unstake-dest"
              placeholder="Defaults to your connected wallet"
              className="font-mono"
              {...register("destination")}
            />
            {errors.destination && (
              <p className="text-xs text-danger">{errors.destination.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Submitting…" : "Unstake"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-xs text-text-secondary">
              Withdrawal of <span className="font-mono text-text-primary">{result.amount} ORVX</span>{" "}
              submitted. Status:{" "}
              <span className="font-mono capitalize text-text-primary">{result.status}</span>.
            </p>
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="text-text-muted">Withdrawal ID</div>
            <code className="font-mono text-text-primary">{result.withdrawal_id}</code>
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
