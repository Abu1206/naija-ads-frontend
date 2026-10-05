interface MetricCardProps {
  label: string;
  value: string;
  loading?: boolean;
  error?: string | null;
}

/** Metric tile with loading / error states. Value is a pre-formatted string. */
export function MetricCard({ label, value, loading = false, error = null }: MetricCardProps) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold" aria-label={`${label}: ${value}`}>
        {loading ? (
          <span role="status" aria-live="polite" className="text-gray-400">
            …
          </span>
        ) : error ? (
          <span role="alert" className="text-sm font-normal text-red-600">
            {error}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
