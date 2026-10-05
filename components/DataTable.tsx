interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
}

/** Shared table with loading / error / empty states (required on every table). */
export function DataTable<T>({
  columns,
  rows,
  loading = false,
  error = null,
  emptyMessage = "No records yet.",
  getRowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="rounded border p-6 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded border p-6 text-center text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border">
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
                <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
