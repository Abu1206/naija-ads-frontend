import { Icon } from "./Icon";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  loading?: boolean;
  error?: string | null;
}

/**
 * Metric tile with loading / error states. Value is a pre-formatted string —
 * money and headings both set in Quicksand (design-system.md), so the tile
 * value uses the display face whatever the number means.
 */
export function MetricCard({ label, value, hint, icon, loading = false, error = null }: MetricCardProps) {
  return (
    <div className="rounded-card border border-mist bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <span className="rounded-lg bg-mint p-2 text-pine">
            <Icon name={icon} />
          </span>
        )}
        {hint && <span className="text-xs font-medium text-muted">{hint}</span>}
      </div>
      <div
        className="mt-3 font-display font-display text-3xl font-bold text-ink tracking-tight text-ink"
        aria-label={`${label}: ${value}`}
      >
        {loading ? (
          <span role="status" aria-live="polite" className="text-mist">
            — —
          </span>
        ) : (
          value
        )}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {error && !loading && (
        <p role="alert" className="mt-2 text-xs break-words text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
