"use client";

import { MotionConfig } from "motion/react";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CHART_METRICS,
  CHART_RANGES,
  METRIC_LABELS,
  MIN_SERIES_POINTS,
  RANGE_LABELS,
  type ChartMetric,
  type ChartRange,
} from "@/lib/ranges";
import { CHART_GOLD, DeliveryChart, type DeliveryPoint } from "./DeliveryChart";
import { ValuePicker } from "./ValuePicker";

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
 * URL-aware chart section: one title row — title on the left, the two pickers
 * grouped on the right (metric, then range) — with the legend on its own line
 * below the chart (Combo only: in single-metric views the dropdown already
 * says what it is). On phones the row stacks: title, then the two pickers
 * side by side.
 *
 * Dropdowns rather than segmented pills: two pill groups never share one row
 * on a phone without stacking, eating vertical space, or overflowing. The
 * animate-UI dropdown menu fits both controls side by side at 360px with no
 * breakpoints, targets ≥44px, and animates only the feedback layer (mint pill
 * sliding between items, content fade+scale) — reduced-motion aware. One extra
 * tap to switch is fine for a control advertisers set and leave alone.
 *
 * State split: `range` is server state — changing it navigates, the server
 * refetches the window at a new grain, and the transition's pending flag dims
 * the old chart and busy-flags the trigger instead of flashing a spinner.
 * `metric` is client state mirrored to the URL with replaceState — no refetch,
 * but refresh- and share-safe.
 */
export function DeliveryChartSection({
  data,
  title,
  range,
  metric: initialMetric,
}: DeliveryChartSectionProps) {
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
    <MotionConfig reducedMotion="user">
      <Card>
        <CardHeader>
          {/* One title row, not a spread pair: title left, both pickers grouped
              right. justify-between parked one control at each card edge with a
              dead gap between them. On phones the row stacks and the triggers
              share the row (flex-1) as before. */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <ValuePicker
                label="Chart metric"
                value={metric}
                options={CHART_METRICS}
                labels={METRIC_LABELS}
                onValueChange={goMetric}
              />
              <ValuePicker
                label="Time range"
                value={range}
                options={CHART_RANGES}
                labels={RANGE_LABELS}
                onValueChange={goRange}
                busy={isPending}
              />
            </div>
          </div>
        </CardHeader>
        {/* Breathing room between the title row and the chart — CardContent
            carries no top padding by default. */}
        <CardContent className="pt-4">
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
                  <line
                    x1="0"
                    y1="4"
                    x2="18"
                    y2="4"
                    stroke={CHART_GOLD}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="4" r="3" fill={CHART_GOLD} />
                </svg>
                CTR %
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </MotionConfig>
  );
}
