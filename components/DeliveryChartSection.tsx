"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CHART_METRICS,
  CHART_RANGES,
  MIN_SERIES_POINTS,
  METRIC_LABELS,
  RANGE_LABELS,
  type ChartMetric,
  type ChartRange,
} from "@/lib/ranges";
import { CHART_GOLD, DeliveryChart, type DeliveryPoint } from "./DeliveryChart";

interface DeliveryChartSectionProps {
  data: DeliveryPoint[];
  title: string;
  /** Server-parsed initials from the URL — the source of truth after each navigation. */
  range: ChartRange;
  metric: ChartMetric;
}

function hrefFor(pathname: string, range: ChartRange, metric: ChartMetric): string {
  return `${pathname}?range=${range}&metric=${metric}`;
}

/**
 * URL-aware chart section: two dropdowns under the title — metric on the left,
 * range on the right — with the legend on its own line below the chart
 * (Combo only: in single-metric views the dropdown already says what it is).
 *
 * Dropdowns rather than segmented pills: two pill groups never share one row
 * on a phone without stacking, eating vertical space, or overflowing. Native
 * selects sit side by side at 360px with no breakpoints, open the platform
 * picker (fast on mid-range Android), and carry arrow-key navigation for
 * free. One extra tap to switch is fine for a control advertisers set and
 * leave alone.
 *
 * State split: `range` is server state — changing it navigates, the server
 * refetches the window at a new grain, and the transition's pending flag dims
 * the old chart instead of flashing a spinner. `metric` is client state
 * mirrored to the URL with replaceState — no refetch, but refresh- and
 * share-safe.
 */
export function DeliveryChartSection({ data, title, range, metric: initialMetric }: DeliveryChartSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [metric, setMetric] = useState<ChartMetric>(initialMetric);
  // No prop-sync effect: callers key the section by range+metric, so
  // back/forward remounts with fresh URL state instead of syncing.

  if (data.length < MIN_SERIES_POINTS) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-mist bg-cloud/60 p-6 text-center text-sm text-muted">
            Your chart appears once ads start delivering
          </p>
        </CardContent>
      </Card>
    );
  }

  const goRange = (next: ChartRange) => {
    if (next === range) return;
    startTransition(() => {
      router.push(hrefFor(pathname, next, metric), { scroll: false });
    });
  };

  const goMetric = (next: ChartMetric) => {
    setMetric(next);
    // Mirror only: no navigation, so no refetch — the URL still shares.
    window.history.replaceState(null, "", hrefFor(pathname, range, next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-2 flex items-center justify-between gap-2">
          <select
            aria-label="Chart metric"
            value={metric}
            onChange={(e) => goMetric(e.target.value as ChartMetric)}
            className="h-11 min-w-0 flex-1 rounded-lg border border-mist bg-white px-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija sm:flex-none"
          >
            {CHART_METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
          <select
            aria-label="Time range"
            value={range}
            onChange={(e) => goRange(e.target.value as ChartRange)}
            aria-busy={isPending}
            className="h-11 min-w-0 flex-1 rounded-lg border border-mist bg-white px-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija sm:flex-none"
          >
            {CHART_RANGES.map((r) => (
              <option key={r} value={r}>
                {RANGE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("transition-opacity", isPending && "opacity-50")}>
          <DeliveryChart data={data} title={title} metric={metric} />
        </div>
        {metric === "combo" && (
          <div className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-naija" aria-hidden="true" />
              Impressions
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="18" height="8" aria-hidden="true" className="shrink-0">
                <line x1="0" y1="4" x2="18" y2="4" stroke={CHART_GOLD} strokeWidth="3" strokeLinecap="round" />
                <circle cx="9" cy="4" r="3" fill={CHART_GOLD} />
              </svg>
              CTR %
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
