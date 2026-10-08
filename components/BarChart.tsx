export interface SeriesPoint {
  label: string;
  primary: number;
  secondary: number;
}

interface BarChartProps {
  data: SeriesPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  ariaLabel: string;
}

/**
 * Presentational bars only — every number arrives pre-computed by the backend.
 * Deliberately not a charting dependency; grows past this and §9 wants an RFC.
 */
export function BarChart({ data, primaryLabel, secondaryLabel, ariaLabel }: BarChartProps) {
  const max = Math.max(1, ...data.flatMap((d) => [d.primary, d.secondary]));
  const summary = data.map((d) => `${d.label}: ${d.primary} ${primaryLabel}`).join(", ");

  return (
    <figure aria-label={`${ariaLabel}. ${summary}`}>
      <figcaption className="mb-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand" aria-hidden="true" />
          {primaryLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gray-300" aria-hidden="true" />
          {secondaryLabel}
        </span>
      </figcaption>
      <div className="flex h-44 items-end gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex h-full flex-1 flex-col justify-end gap-1">
            <div className="flex h-full items-end justify-center gap-1">
              <div
                className="w-1/2 rounded-t bg-brand"
                style={{ height: `${(point.primary / max) * 100}%` }}
              />
              <div
                className="w-1/2 rounded-t bg-gray-300"
                style={{ height: `${(point.secondary / max) * 100}%` }}
              />
            </div>
            <span className="text-center text-[10px] text-gray-500">{point.label}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
