import type { ReactNode } from "react";
import type { Delta } from "@/lib/format";
import { Icon } from "./Icon";
import { Naira } from "./Naira";

export interface MetricDelta extends Delta {
  /** "vs Sep" — always text, so the trend is never colour-only. */
  caption?: string;
}

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
  /** Small "↑ 9.6% vs Sep" comparison beneath the label. */
  delta?: MetricDelta | null;
  /** Extra context under the delta — e.g. the wallet card's spent + fund footer. */
  footer?: ReactNode;
}

const DELTA_STYLES: Record<MetricDelta["direction"], string> = {
  up: "text-mint",
  down: "text-ember",
  flat: "text-mint/70",
};

/**
 * Metric tile on Deep Forest: icon chip in a white wash, numeral in
 * Quicksand (design-system.md), label and hint in pale green. Value is a
 * pre-formatted string — money math lives server-side.
 *
 * The tile is a flex column with a bottom-pinned zone: in a mixed row (plain
 * cards next to the wallet card's spent + fund footer) every card shares the
 * row height and deltas/footers sit on one baseline instead of each card
 * ending wherever its own content stops.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  loading = false,
  error = null,
  tone = "default",
  delta = null,
  footer = null,
}: MetricCardProps) {
  const showBottom = Boolean(delta || footer || (error && !loading));
  return (
    <div className="flex flex-col self-stretch rounded-card bg-forest p-4">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <span className="rounded-lg bg-white/10 p-2 text-mint">
            <Icon name={icon} />
          </span>
        )}
        {hint && <span className="text-xs font-medium text-mint/70">{hint}</span>}
      </div>
      <div
        className={`mt-2 font-display text-[26px] leading-tight font-bold tracking-tight ${tone === "money" ? "text-gold" : "text-white"}`}
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
      <div className="mt-0.5 text-[13px] text-mint/70">{label}</div>
      {showBottom && (
        <div className="mt-auto">
          {delta && (
            <p className={`mt-1 text-xs font-semibold ${DELTA_STYLES[delta.direction]}`}>
              {delta.text}
              {delta.caption && <span className="font-medium text-mint/70"> {delta.caption}</span>}
            </p>
          )}
          {footer}
          {error && !loading && (
            <p role="alert" className="mt-2 text-xs break-words text-ember">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
