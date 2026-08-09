import { cn } from "@/lib/utils/cn";

export interface DocsColumn<Row> {
  /** Lowercase mono header, matching the pricing/endpoint tables elsewhere. */
  header: string;
  /** Cell content. Returning a string keeps rows declarative; JSX is allowed
   *  for the few cells that need emphasis. */
  cell: (row: Row) => React.ReactNode;
  /** Renders in text-primary instead of text-secondary — for the key column. */
  emphasis?: boolean;
  className?: string;
}

/**
 * The mono reference table used throughout /docs. Scrolls horizontally on
 * narrow viewports rather than wrapping mono text into unreadable columns.
 */
export function DocsTable<Row>({
  columns,
  rows,
  rowKey,
}: {
  columns: DocsColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] font-mono text-xs">
        <thead>
          <tr className="text-text-muted">
            {columns.map((col) => (
              <th key={col.header} className="py-2 pr-6 text-left font-normal last:pr-0">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="border-t border-border text-text-secondary">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn(
                    "py-2 pr-6 align-top last:pr-0",
                    col.emphasis && "text-text-primary",
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Inline `code` styling for prose — mono, primary, no background. */
export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-text-primary">{children}</span>;
}
