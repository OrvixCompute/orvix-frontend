import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
}

/**
 * Inline text navigation: a horizontal list of links separated by " · ".
 * No background, no border — just text.
 */
export function InlineNav({
  items,
  className,
  separator = "·",
}: {
  items: readonly NavItem[];
  className?: string;
  separator?: string;
}) {
  return (
    <nav className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-x-3">
          {i > 0 && <span className="select-none text-text-muted">{separator}</span>}
          <Link
            href={item.href}
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
