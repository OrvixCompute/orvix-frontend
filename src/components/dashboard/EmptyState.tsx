import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <Icon size={24} className="text-text-muted" />
      <p className="mt-4 text-sm text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-tertiary">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
