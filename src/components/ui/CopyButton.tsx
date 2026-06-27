"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Copy `value` to the clipboard with a brief confirmation state. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-text-secondary",
        className,
      )}
      aria-label="Copy"
    >
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      {label && <span className="text-xs">{copied ? "copied" : label}</span>}
    </button>
  );
}
