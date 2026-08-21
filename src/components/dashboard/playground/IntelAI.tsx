"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { IntelData } from "@/components/dashboard/playground/TokenIntel";

export function IntelAI({ data }: { data: IntelData }) {
  const { intelligence } = data;

  if (!intelligence) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-bg-secondary py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border-strong bg-bg-tertiary">
          <GpuIcon />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-text-tertiary">AI Intelligence unavailable</p>
          <p className="text-xs text-text-muted">
            The GPU node could not generate an analysis for this token
          </p>
        </div>
      </div>
    );
  }

  const { analysis } = intelligence;

  return (
    <div className="space-y-4">
      {/* Narrative */}
      <div className="rounded-lg border border-border bg-bg-secondary p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
          AI Analysis
        </div>
        <blockquote className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-text-primary">
          {analysis.narrative}
        </blockquote>
      </div>

      {/* Risk Flags */}
      {analysis.risk_flags.length > 0 && (
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Risk Flags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.risk_flags.map((flag, i) => (
              <Badge key={i} className="border-danger/30 text-danger">
                {flag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Watch Next */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-accent">
          Watch Next
        </div>
        <p className="text-sm text-text-primary">{analysis.watch_next}</p>
      </div>

      {/* Footer metadata */}
      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-border pt-3 text-[11px] text-text-muted">
        <span>Model: {intelligence.model}</span>
        <span>Latency: {intelligence.latency_ms}ms</span>
        <span>Node: {intelligence.node_id}</span>
      </div>
    </div>
  );
}

function GpuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <rect x="6" y="10" width="4" height="4" rx="0.5" />
      <rect x="14" y="10" width="4" height="4" rx="0.5" />
      <line x1="6" y1="6" x2="6" y2="2" />
      <line x1="10" y1="6" x2="10" y2="2" />
      <line x1="14" y1="6" x2="14" y2="2" />
      <line x1="18" y1="6" x2="18" y2="2" />
    </svg>
  );
}
