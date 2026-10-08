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
    <section className="rounded-xl border bg-white">
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
          {title ? <h2 className="font-semibold">{title}</h2> : <span />}
          {action}
        </header>
      )}
      <div className="p-5">
        {loading ? (
          <div role="status" aria-live="polite" className="rounded-lg border p-6 text-center text-gray-500">
            Loading…
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row, i) => (
                  <tr key={getRowKey(row, i)}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
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
