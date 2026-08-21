"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/*  ScoreGauge — SVG circular progress with color gradient by value   */
/* ------------------------------------------------------------------ */

interface ScoreGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function gaugeColor(value: number, max: number): string {
  const pct = (value / max) * 100;
  if (pct < 40) return "#ef4444"; // danger
  if (pct < 70) return "#f59e0b"; // warning
  return "#10b981"; // success
}

export function ScoreGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - pct);
  const color = gaugeColor(value, max);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-tertiary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-text-primary">{value}</span>
        {label && <span className="text-[11px] text-text-muted">{label}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TruncatedAddress — first 4 + "..." + last 4, click-to-copy       */
/* ------------------------------------------------------------------ */

interface TruncatedAddressProps {
  address: string;
  chars?: number;
  className?: string;
}

export function TruncatedAddress({ address, chars = 4, className }: TruncatedAddressProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const truncated =
    address.length > chars * 2 + 3
      ? `${address.slice(0, chars)}...${address.slice(-chars)}`
      : address;

  return (
    <button
      type="button"
      onClick={copy}
      title={address}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs text-text-secondary transition-colors hover:text-text-primary",
        className,
      )}
    >
      {truncated}
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-text-muted" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard — label on top, value below, optional trend color      */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({ label, value, icon, trend, className }: MetricCardProps) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-text-primary";

  return (
    <div className={cn("rounded-lg border border-border bg-bg-secondary p-4", className)}>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {icon}
        {label}
      </div>
      <div className={cn("text-lg font-semibold", trendColor)}>{value}</div>
    </div>
  );
}
