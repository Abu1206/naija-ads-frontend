interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
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

/** Shared table with loading / error / empty states (required on every table). */
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
        <header className="flex items-center justify-between gap-3 border-b border-mist px-5 py-4">
          {title ? <h2 className="font-display font-semibold text-ink">{title}</h2> : <span />}
          {action}
        </header>
      )}
      <div className="p-5">
        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-mist p-6 text-center text-muted"
          >
            Loading…
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-alert/30 bg-blush p-6 text-center text-alert">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-mist p-6 text-center text-muted">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-mist">
            <table className="min-w-full divide-y divide-mist">
              <thead className="bg-cloud">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold tracking-wider text-muted uppercase"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-white">
                {rows.map((row, i) => (
                  <tr key={getRowKey(row, i)}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-ink">
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
