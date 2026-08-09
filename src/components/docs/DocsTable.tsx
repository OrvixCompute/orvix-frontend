import { cn } from "@/lib/utils/cn";

export interface DocsColumn<Row> {
  /** Lowercase mono header, matching the pricing/endpoint tables elsewhere. */
  header: string;
  /** Cell content. Returning a string keeps rows declarative; JSX is allowed
   *  for the few cells that need emphasis. */
  cell: (row: Row) => React.ReactNode;
  /** Renders in text-primary instead of text-secondary — for the key column.
   *  Emphasised columns also become the heading of the stacked mobile card. */
  emphasis?: boolean;
  className?: string;
}

/**
 * The mono reference table used throughout the site.
 *
 * Below `sm` it is not a table at all. These carry three to five columns of
 * mono text, which needs ~34rem to breathe — wider than a phone, so a table
 * there either overflows the page or hides its last columns behind a scroll
 * nobody can see. Each row becomes a labelled block instead, and the table
 * proper returns once there is room for it.
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
  // The key columns lead the stacked card; the rest become label/value lines.
  const leading = columns.filter((col) => col.emphasis);
  const heading = leading.length > 0 ? leading : columns.slice(0, 1);
  const details = columns.filter((col) => !heading.includes(col));

  return (
    <>
      {/* Stacked, phone-width. */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row, i) => (
          <div
            key={rowKey(row, i)}
            className="space-y-1.5 rounded-md border border-border px-3 py-2.5"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-text-primary">
              {heading.map((col) => (
                <span key={col.header}>{col.cell(row)}</span>
              ))}
            </div>
            {details.map((col) => (
              <div key={col.header} className="flex gap-2 text-xs">
                <span className="w-24 shrink-0 font-mono text-text-muted">{col.header}</span>
                <span className={cn("min-w-0 flex-1 text-text-secondary", col.className)}>
                  {col.cell(row)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Table, once the columns fit. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full font-mono text-xs">
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
    </>
  );
}

/** Inline `code` styling for prose — mono, primary, no background. */
export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-text-primary">{children}</span>;
}
