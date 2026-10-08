import { Icon } from "./Icon";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  loading?: boolean;
  error?: string | null;
}

/** Metric tile with loading / error states. Value is a pre-formatted string. */
export function MetricCard({ label, value, hint, icon, loading = false, error = null }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <span className="rounded-lg bg-gray-100 p-2 text-brand">
            <Icon name={icon} />
          </span>
        )}
        {hint && <span className="text-xs font-medium text-gray-500">{hint}</span>}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight" aria-label={`${label}: ${value}`}>
        {loading ? (
          <span role="status" aria-live="polite" className="text-gray-300">
            — —
          </span>
        ) : (
          value
        )}
      </div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
      {error && !loading && (
        <p role="alert" className="mt-2 text-xs break-words text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
