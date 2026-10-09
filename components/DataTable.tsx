interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Right-align header and cells for metric columns (impressions, spend…). */
  numeric?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  title?: string;
  action?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
}

/** Standalone table card: one Mist frame, title with no divider, and the
 * table sitting flush inside it — row dividers only, no nested bordered box.
 * Numbers get tabular figures and rows lift on hover so dense metrics scan. */
export function DataTable<T>({
  columns,
  rows,
  title,
  action,
  loading = false,
  error = null,
  emptyMessage = "No records yet.",
  getRowKey,
}: DataTableProps<T>) {
  return (
    <section className="rounded-card border border-mist bg-white">
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
          {title ? <h2 className="font-display font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </header>
      )}
      <div className="pb-4">
        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="mx-5 rounded-lg border border-mist p-6 text-center text-muted"
          >
            Loading…
          </div>
        ) : error ? (
          <div role="alert" className="mx-5 rounded-lg border border-alert/30 bg-blush p-6 text-center text-alert">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="mx-5 rounded-lg border border-mist p-6 text-center text-muted">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-mist">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={`px-5 py-2.5 text-xs font-bold tracking-wider text-muted uppercase ${col.numeric ? "text-right" : "text-left"}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-white">
                {rows.map((row, i) => (
                  <tr key={getRowKey(row, i)} className="transition-colors hover:bg-cloud/70">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 text-sm text-ink ${col.numeric ? "text-right" : "text-left"}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
