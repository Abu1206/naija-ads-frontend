"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatCTR, formatCount } from "@/lib/format";

// Pure formatter re-exported for existing callers; the implementation lives in
// lib/format.ts so server pages can use it (a "use client" module's function
// exports cannot be invoked from the server).
export { deliveryLabel } from "@/lib/format";

export interface DeliveryPoint {
  label: string;
  impressions: number;
  clicks: number;
}

interface DeliveryChartProps {
  data: DeliveryPoint[];
  title: string;
  /** Daily series get day-based ranges (7D/30D/90D); monthly series get
   * period ranges (Last 3 / All). Defaults to monthly. */
  grain?: "daily" | "monthly";
}

const NAIJA = "#008751";
const PINE = "#006B40";
/**
 * Chart-only CTR gold. Matte Gold (#CFA24A) is ~2.3:1 on white and ~2:1 on
 * Naija Green, so the line vanished where it crossed bars. #A87A1F clears
 * 3:1 on white for graphics while staying in the gold family ("results").
 * Money surfaces keep Matte Gold.
 */
const GOLD = "#A87A1F";
const MIST = "#D9E2D6";
const MUTED = "#4D6054";

/** Frontend never invents buckets: it shows the backend series, capped at the
 * last 30 points so a daily grain renders as "last 30 days" automatically. */
const MAX_POINTS = 30;

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Period labels: see `deliveryLabel` in lib/format.ts (re-exported above). */

/** Headroom + snap so the CTR line gets most of the plot height. */
function ctrCeiling(values: number[]): number {  const raw = Math.max(0, ...values);
  if (raw <= 0) return 0.01;
  const target = raw * 1.15;
  for (const step of [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.075, 0.1, 0.15, 0.2]) {
    if (target <= step) return step;
  }
  return target;
}

function pctTick(frac: number): string {
  const v = frac * 100;
  return `${Number.isInteger(Math.round(v * 10) / 10) ? Math.round(v) : v.toFixed(1)}%`;
}

/**
 * Left-axis ceiling with ~60% headroom, snapped to a nice number. Bars then
 * sit in the lower part of the chart so the gold CTR line floats above them
 * instead of cutting across bar tops (gold-on-green is ~1.2:1 — separation,
 * not color, carries this). Current data (1.84M max) lands on 3M.
 */
function viewsCeiling(max: number): number {
  if (max <= 0) return 1;
  const target = max * 1.6;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const normalized = target / magnitude;
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) {
    if (normalized <= step) return step * magnitude;
  }
  return 10 * magnitude;
}

const chartConfig = {
  views: {
    label: "Views",
    color: NAIJA,
  },
  clicks: {
    label: "Clicks",
    color: NAIJA,
  },
  ctr: {
    label: "CTR",
    color: GOLD,
  },
} satisfies ChartConfig;

interface ChartRow {
  label: string;
  views: number;
  clicks: number;
  ctr: number;
}

interface TooltipEntry {
  payload?: ChartRow;
}

export function DeliveryTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active) return null;
  const row = payload?.[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-mist bg-white px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-bold text-ink">{label ?? row.label}</div>
      <div className="text-muted">{formatCount(row.views)} views</div>
      <div className="text-muted">{formatCount(row.clicks)} clicks</div>
      <div className="mt-0.5 font-bold text-pine">{formatCTR(row.clicks, row.views)} CTR</div>
    </div>
  );
}

type MobileTab = "impressions" | "clicks" | "ctr";

const TABS: { id: MobileTab; label: string }[] = [
  { id: "impressions", label: "Impressions" },
  { id: "clicks", label: "Clicks" },
  { id: "ctr", label: "CTR" },
];

type DesktopMetric = "combo" | MobileTab;

const DESKTOP_METRICS: { id: DesktopMetric; label: string }[] = [
  { id: "combo", label: "Combo" },
  { id: "impressions", label: "Impressions" },
  { id: "clicks", label: "Clicks" },
  { id: "ctr", label: "CTR" },
];

interface RangeOption {
  value: number | "all";
  label: string;
}

/**
 * Time ranges slice the backend series — they never re-bucket it. Daily
 * series get day windows; monthly series get period windows so a 6-month
 * series still offers a real choice (Last 3 / All) instead of four identical
 * buttons. A single option means no control renders.
 */
function rangeOptions(total: number, grain: "daily" | "monthly"): RangeOption[] {
  if (grain === "daily") {
    const options: RangeOption[] = [];
    if (total > 7) options.push({ value: 7, label: "7D" });
    if (total > 30) options.push({ value: 30, label: "30D" });
    if (total > 90) options.push({ value: 90, label: "90D" });
    options.push({ value: "all", label: total > 1 ? `All (${total})` : "All" });
    return options;
  }
  const options: RangeOption[] = [];
  if (total > 3) options.push({ value: 3, label: "Last 3" });
  if (total > 6) options.push({ value: 6, label: "Last 6" });
  options.push({ value: "all", label: total > 1 ? `All (${total})` : "All" });
  return options;
}

const AXIS_TICK = { fontSize: 11, fill: MUTED };
const AXIS_TITLE = { fontSize: 11, fontWeight: 700, fill: MUTED } as const;

/**
 * Delivery chart on the shadcn chart pattern (recharts + Card): desktop gets
 * a bars-and-line combo — view bars on the left axis, CTR line on the right —
 * and small screens get tabbed single-series bar/line charts. Raw clicks
 * (~2% of views) live in the tooltip, never as same-axis bars. Display-only:
 * every number arrives backend-computed (AGENTS.md §6.1).
 */
export function DeliveryChart({ data, title, grain = "monthly" }: DeliveryChartProps) {
  const options = rangeOptions(data.length, grain);
  const [range, setRange] = useState<number | "all">("all");
  const [metric, setMetric] = useState<DesktopMetric>("combo");
  const [tab, setTab] = useState<MobileTab>("impressions");

  const ranged = range === "all" ? data : data.slice(-range);
  const visible = ranged.slice(-MAX_POINTS);

  if (visible.length === 0) return null;

  const rows: ChartRow[] = visible.map((d) => ({
    label: d.label,
    views: d.impressions,
    clicks: d.clicks,
    ctr: d.impressions > 0 ? d.clicks / d.impressions : 0,
  }));
  const maxCtr = ctrCeiling(rows.map((r) => r.ctr));
  const viewsMax = viewsCeiling(Math.max(0, ...rows.map((r) => r.views)));
  const clicksMax = viewsCeiling(Math.max(0, ...rows.map((r) => r.clicks)));
  const summary = visible
    .map((d) => `${d.label}: ${formatCount(d.impressions)} impressions, ${formatCTR(d.clicks, d.impressions)} CTR`)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {/* Desktop metric switch: plain buttons with aria-pressed so they
              never collide with the mobile tablist roles below. */}
          <div role="group" aria-label="Chart metric" className="hidden items-center gap-1 rounded-lg bg-cloud p-1 sm:flex">
            {DESKTOP_METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={metric === m.id}
                onClick={() => setMetric(m.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija ${
                  metric === m.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {options.length > 1 && (
          <div role="group" aria-label="Time range" className="flex flex-wrap items-center gap-1">
            {options.map((o) => (
              <button
                key={o.label}
                type="button"
                aria-pressed={range === o.value}
                onClick={() => setRange(o.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija ${
                  range === o.value ? "bg-forest text-white" : "text-muted hover:bg-cloud hover:text-ink"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <figure aria-label={`${title}. ${summary}`}>
          <figcaption className="mb-3 hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:flex">
            {metric !== "clicks" && metric !== "ctr" && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-naija" aria-hidden="true" />
                Views
              </span>
            )}
            {metric === "clicks" && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-naija" aria-hidden="true" />
                Clicks
              </span>
            )}
            {(metric === "combo" || metric === "ctr") && (
              <span className="flex items-center gap-1.5">
                <svg width="18" height="8" aria-hidden="true" className="shrink-0">
                  <line x1="0" y1="4" x2="18" y2="4" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
                  <circle cx="9" cy="4" r="3" fill={GOLD} />
                </svg>
                CTR %
              </span>
            )}
          </figcaption>

          {/* Desktop charts */}
          <div className="hidden sm:block">
            {metric === "combo" && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ComposedChart accessibilityLayer data={rows} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={MIST} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                  <YAxis
                    yAxisId="views"
                    orientation="left"
                    width={52}
                    domain={[0, viewsMax]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => compact.format(v)}
                    tick={AXIS_TICK}
                    label={{ value: "Views", angle: -90, position: "insideLeft", offset: 6, style: AXIS_TITLE }}
                  />
                  <YAxis
                    yAxisId="ctr"
                    orientation="right"
                    width={52}
                    domain={[0, maxCtr]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={pctTick}
                    tick={AXIS_TICK}
                    label={{ value: "CTR %", angle: 90, position: "insideRight", offset: 6, style: AXIS_TITLE }}
                  />
                  <ChartTooltip cursor={{ fill: MIST, opacity: 0.4 }} content={<DeliveryTooltipContent />} />
                  <Bar yAxisId="views" dataKey="views" name="Views" fill="var(--color-views)" radius={4} maxBarSize={46} />
                  <Line
                    yAxisId="ctr"
                    dataKey="ctr"
                    name="CTR"
                    type="monotone"
                    stroke="var(--color-ctr)"
                    strokeWidth={3}
                    dot={{ fill: GOLD, r: 3.5 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ChartContainer>
            )}
            {(metric === "impressions" || metric === "clicks") && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={MIST} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                  <YAxis
                    width={52}
                    domain={[0, metric === "clicks" ? clicksMax : viewsMax]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => compact.format(v)}
                    tick={AXIS_TICK}
                    label={{
                      value: metric === "clicks" ? "Clicks" : "Views",
                      angle: -90,
                      position: "insideLeft",
                      offset: 6,
                      style: AXIS_TITLE,
                    }}
                  />
                  <ChartTooltip cursor={{ fill: MIST, opacity: 0.4 }} content={<DeliveryTooltipContent />} />
                  <Bar
                    dataKey={metric === "clicks" ? "clicks" : "views"}
                    name={metric === "clicks" ? "Clicks" : "Views"}
                    fill={metric === "clicks" ? "var(--color-clicks)" : "var(--color-views)"}
                    radius={4}
                    maxBarSize={46}
                  />
                </BarChart>
              </ChartContainer>
            )}
            {metric === "ctr" && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={MIST} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                  <YAxis
                    width={52}
                    domain={[0, maxCtr]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={pctTick}
                    tick={AXIS_TICK}
                    label={{ value: "CTR %", angle: -90, position: "insideLeft", offset: 6, style: AXIS_TITLE }}
                  />
                  <ChartTooltip cursor={{ stroke: MIST }} content={<DeliveryTooltipContent />} />
                  <Line
                    dataKey="ctr"
                    name="CTR"
                    type="monotone"
                    stroke="var(--color-ctr)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-ctr)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>

          {/* Small screens: one metric at a time */}
          <div className="sm:hidden">
            <div role="tablist" aria-label="Delivery metric" className="grid grid-cols-3 gap-1 rounded-lg bg-cloud p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`delivery-tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls="delivery-panel"
                  onClick={() => setTab(t.id)}
                  className={`min-h-[44px] rounded-md px-3 py-2 text-sm font-medium ${
                    tab === t.id ? "bg-white text-ink shadow-sm" : "text-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div role="tabpanel" id="delivery-panel" aria-labelledby={`delivery-tab-${tab}`} className="mt-3">
              {tab === "ctr" ? (
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <LineChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={MIST} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                    <YAxis
                      width={52}
                      domain={[0, maxCtr]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={pctTick}
                      tick={AXIS_TICK}
                      label={{ value: "CTR %", angle: -90, position: "insideLeft", offset: 6, style: AXIS_TITLE }}
                    />
                    <ChartTooltip cursor={{ stroke: MIST }} content={<DeliveryTooltipContent />} />
                    <Line
                      dataKey="ctr"
                      name="CTR"
                      type="monotone"
                      stroke="var(--color-ctr)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-ctr)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <BarChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={MIST} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                    <YAxis
                      width={52}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => compact.format(v)}
                      tick={AXIS_TICK}
                      label={{
                        value: tab === "clicks" ? "Clicks" : "Views",
                        angle: -90,
                        position: "insideLeft",
                        offset: 6,
                        style: AXIS_TITLE,
                      }}
                    />
                    <ChartTooltip cursor={{ fill: MIST, opacity: 0.4 }} content={<DeliveryTooltipContent />} />
                    <Bar
                      dataKey={tab === "clicks" ? "clicks" : "views"}
                      name={tab === "clicks" ? "Clicks" : "Views"}
                      fill={tab === "clicks" ? "var(--color-clicks)" : "var(--color-views)"}
                      radius={6}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </div>
        </figure>
      </CardContent>
    </Card>
  );
}
