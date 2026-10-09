import { Icon } from "./Icon";
import { Naira } from "./Naira";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  loading?: boolean;
  error?: string | null;
  /** "money" sets the numeral in gold — the one place gold appears outside
   * the wallet card. Counts, rates and ratios stay white. */
  tone?: "default" | "money";
}

/**
 * Metric tile on Deep Forest: icon chip in a white wash, numeral in
 * Quicksand (design-system.md), label and hint in pale green. Value is a
 * pre-formatted string — money math lives server-side.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  loading = false,
  error = null,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className="rounded-card bg-forest p-5">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <span className="rounded-lg bg-white/10 p-2 text-mint">
            <Icon name={icon} />
          </span>
        )}
        {hint && <span className="text-xs font-medium text-mint/70">{hint}</span>}
      </div>
      <div
        className={`mt-3 font-display text-3xl font-bold tracking-tight ${tone === "money" ? "text-gold" : "text-white"}`}
        aria-label={`${label}: ${value}`}
      >
        {loading ? (
          <span role="status" aria-live="polite" className="text-white/30">
            — —
          </span>
        ) : (
          <Naira value={value} />
        )}
      </div>
      <div className="mt-1 text-sm text-mint/70">{label}</div>
      {error && !loading && (
        <p role="alert" className="mt-2 text-xs break-words text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
