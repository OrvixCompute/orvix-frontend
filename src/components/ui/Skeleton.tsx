import { cn } from "@/lib/utils/cn";

/** Low-key loading placeholder — opacity pulse only, no shimmer/gradient. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-bg-tertiary", className)}
      {...props}
    />
  );
}
