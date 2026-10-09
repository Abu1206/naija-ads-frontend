"use client";

import { useRef, useState, useTransition } from "react";
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

interface DeliveryChartSectionProps {
  data: DeliveryPoint[];
  title: string;
  /** Server-parsed initials from the URL — the source of truth after each navigation. */
  range: ChartRange;
  metric: ChartMetric;
}

/** One segmented-pill toolbar for both groups: Cloud tray, white selected pill. */
const PILL = "min-h-[44px] rounded-md px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija";
const PILL_ON = "bg-white text-naija shadow-sm";
const PILL_OFF = "text-muted hover:text-ink";

function hrefFor(pathname: string, range: ChartRange, metric: ChartMetric): string {
  return `${pathname}?range=${range}&metric=${metric}`;
}

/**
 * URL-aware chart section: metric tabs on the left, range on the right, legend
 * on its own line below (Combo only — in single-metric views the tab name
 * already says what the chart is).
 *
 * State split: `range` is server state (a change refetches the window at a new
 * grain via router.push, and the transition's pending flag dims the old chart
 * instead of flashing a spinner). `metric` is client state mirrored to the
 * URL with replaceState — no refetch, but refresh- and share-safe.
 */
export function DeliveryChartSection({ data, title, range, metric: initialMetric }: DeliveryChartSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [metric, setMetric] = useState<ChartMetric>(initialMetric);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  const stepFocus = (
    refs: (HTMLButtonElement | null)[],
    ids: readonly unknown[],
    current: unknown,
    key: string,
    select: (id: never) => void,
  ) => {
    let idx = ids.indexOf(current);
    if (key === "ArrowRight" || key === "ArrowDown") idx = (idx + 1) % ids.length;
    else if (key === "ArrowLeft" || key === "ArrowUp") idx = (idx - 1 + ids.length) % ids.length;
    else if (key === "Home") idx = 0;
    else if (key === "End") idx = ids.length - 1;
    else return;
    const id = ids[idx];
    select(id as never);
    refs[idx]?.focus();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Chart metric"
            className="grid w-full grid-cols-4 gap-1 rounded-lg bg-cloud p-1 sm:flex sm:w-auto"
            onKeyDown={(e) =>
              stepFocus(tabRefs.current, CHART_METRICS, metric, e.key, (id: ChartMetric) => goMetric(id))
            }
          >
            {CHART_METRICS.map((m, i) => (
              <button
                key={m}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`delivery-metric-tab-${m}`}
                aria-selected={metric === m}
                onClick={() => goMetric(m)}
                className={cn(PILL, "flex-1 sm:flex-none", metric === m ? PILL_ON : PILL_OFF)}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>
          <div
            role="radiogroup"
            aria-label="Time range"
            className="hidden items-center gap-1 rounded-lg bg-cloud p-1 sm:inline-flex"
            onKeyDown={(e) =>
              stepFocus(radioRefs.current, CHART_RANGES, range, e.key, (id: ChartRange) => goRange(id))
            }
          >
            {CHART_RANGES.map((r, i) => (
              <button
                key={r}
                ref={(el) => {
                  radioRefs.current[i] = el;
                }}
                role="radio"
                aria-checked={range === r}
                onClick={() => goRange(r)}
                className={cn(PILL, range === r ? PILL_ON : PILL_OFF)}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <select
            aria-label="Time range"
            value={range}
            onChange={(e) => goRange(e.target.value as ChartRange)}
            className="min-h-[44px] rounded-lg border border-mist bg-white px-3 text-sm font-semibold text-ink sm:hidden"
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
        <div
          role="tabpanel"
          aria-labelledby={`delivery-metric-tab-${metric}`}
          aria-busy={isPending}
          className={cn("transition-opacity", isPending && "opacity-50")}
        >
          <DeliveryChart data={data} title={title} metric={metric} />
        </div>
        {metric === "combo" && (
          <div className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-naija" aria-hidden="true" />
              Views
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
