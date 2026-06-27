"use client";

import { useCallback } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addToast, removeToast, type ToastVariant } from "@/lib/store/slices/uiSlice";

interface ToastInput {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

/** Dispatch transient toasts. Rendering + auto-dismiss live in <Toaster />. */
export function useToast() {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (input: ToastInput | string) => {
      dispatch(addToast(typeof input === "string" ? { message: input } : input));
    },
    [dispatch],
  );

  const dismiss = useCallback((id: string) => dispatch(removeToast(id)), [dispatch]);

  return { toast, dismiss };
}
