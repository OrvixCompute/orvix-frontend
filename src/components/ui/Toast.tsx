"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { removeToast, type Toast as ToastData } from "@/lib/store/slices/uiSlice";
import { cn } from "@/lib/utils/cn";

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const;

const ACCENT = {
  success: "text-success",
  error: "text-danger",
  info: "text-text-secondary",
} as const;

function ToastItem({ toast }: { toast: ToastData }) {
  const dispatch = useAppDispatch();
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dispatch(removeToast(toast.id)), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      role="status"
      className="flex w-full animate-fade-in items-start gap-3 rounded-md border border-border bg-bg-tertiary px-3.5 py-3 shadow-lg"
    >
      <Icon size={16} className={cn("mt-0.5 shrink-0", ACCENT[toast.variant])} />
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm text-text-primary">{toast.title}</p>}
        <p className={cn("text-sm", toast.title ? "text-text-secondary" : "text-text-primary")}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss"
        className="shrink-0 text-text-muted transition-colors hover:text-text-secondary"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Global toast outlet. Mounted once near the app root. */
export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 py-4 sm:justify-end sm:px-6">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </div>
  );
}
