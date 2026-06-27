import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-strong",
        className,
      )}
      {...props}
    />
  );
}
