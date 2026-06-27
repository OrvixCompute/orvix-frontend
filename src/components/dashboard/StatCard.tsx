import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
}

export function StatCard({ label, value, hint, loading }: StatCardProps) {
  return (
    <Card className="space-y-2">
      <div className="text-xs text-text-muted">{label}</div>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <div className="font-mono text-xl text-text-primary">{value}</div>
      )}
      {hint && <div className="text-[11px] text-text-tertiary">{hint}</div>}
    </Card>
  );
}
