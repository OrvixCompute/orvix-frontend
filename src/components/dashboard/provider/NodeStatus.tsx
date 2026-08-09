import { cn } from "@/lib/utils/cn";

/**
 * Live connection state for a node.
 *
 * Driven solely by `is_connected`, which reflects the orchestrator's in-memory
 * WebSocket registry and drops anything that stops heartbeating within 60
 * seconds. The `last_heartbeat` column looks like it belongs here and does not:
 * it is written once at registration and never updated, so a node that has been
 * serving all day still carries a timestamp from the day it was set up.
 */
export function NodeStatus({
  isConnected,
  className,
}: {
  isConnected: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-success" : "bg-text-muted")}
      />
      <span className={cn("text-xs", isConnected ? "text-success" : "text-text-muted")}>
        {isConnected ? "connected" : "offline"}
      </span>
    </span>
  );
}

/** "24 GB" from 24564 MB. Null-safe — the column is nullable until a node reports. */
export function formatVram(vramMb: number | null | undefined): string | null {
  if (vramMb === null || vramMb === undefined || !Number.isFinite(vramMb)) return null;
  return `${Math.round(vramMb / 1024)} GB`;
}
