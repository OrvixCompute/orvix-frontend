"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateKeyMutation } from "@/lib/store/api/apiKeysApi";
import type { CreateApiKeyResponse } from "@/lib/types/orvix";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(64, "Keep it under 64 characters"),
});
type FormValues = z.infer<typeof schema>;

export function CreateKeyDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (res: CreateApiKeyResponse) => void;
}) {
  const [createKey, { isLoading }] = useCreateKeyMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "" } });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await createKey({ name: values.name }).unwrap();
      reset();
      onCreated(res);
    } catch {
      setError("name", { message: "Could not create the key. Please try again." });
    }
  };

  return (
    <Modal open={open} onClose={close} title="Create API key">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="key-name" className="text-sm text-text-secondary">
            Name
          </label>
          <Input
            id="key-name"
            placeholder="e.g. production-server"
            autoFocus
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Creating…" : "Create key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
