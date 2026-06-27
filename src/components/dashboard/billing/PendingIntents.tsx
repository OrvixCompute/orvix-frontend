import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatDateTime } from "@/lib/utils/format";
import type { TopupIntentInfo } from "@/lib/types/orvix";

/**
 * Pending top-up intents — shown so a user who closed the dialog can still
 * recover the memo they need to attach to their transfer.
 */
export function PendingIntents({ intents }: { intents: TopupIntentInfo[] }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <Clock size={14} className="text-text-muted" />
        Pending top-ups
      </h2>
      <Card className="divide-y divide-border p-0">
        {intents.map((intent) => (
          <div
            key={intent.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-text-muted">memo</span>
              <code className="font-mono text-xs text-text-primary">{intent.memo}</code>
              <CopyButton value={intent.memo} className="shrink-0" />
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <span className="font-mono text-text-secondary">
                {intent.expected_amount ? `$${intent.expected_amount}` : "any"}
              </span>
              <span>
                <span className="text-text-tertiary">expires </span>
                {formatDateTime(intent.expires_at)}
              </span>
              <Badge className="border-warning/30 text-warning">{intent.status}</Badge>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
