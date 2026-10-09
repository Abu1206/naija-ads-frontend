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
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatCTR, formatCount } from "@/lib/format";
import { METRIC_LABELS, type ChartMetric } from "@/lib/ranges";

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
  /** Owned by the section toolbar (URL state) — the chart only renders it. */
  metric: ChartMetric;
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
/** Legend swatches live in the section header, outside ChartContainer's CSS vars. */
export const CHART_GOLD = GOLD;
const MIST = "#D9E2D6";
const MUTED = "#4D6054";

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Aligned round axes, five equal steps each. Both domains start at zero with
 * the same tick count, so tick positions coincide and the horizontal gridlines
 * pass through both axes' labels at once. Bars fill ~43% of the height and the
 * CTR line rides at ~70% — separation, not color, keeps the line clear of the
 * bars (gold-on-green is ~1.2:1). Current 30D data lands exactly on 0–100K by
 * 20K and 0–5% by 1%.
 */
const AXIS_INTERVALS = 5;
const BAR_FILL = 0.43;
const LINE_FILL = 0.7;

function roundStep(target: number): number {
  const raw = target / AXIS_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const k of [1, 2, 2.5, 5, 10]) {
    if (k * magnitude >= raw) return k * magnitude;
  }
  return 10 * magnitude;
}

interface AxisScale {
  max: number;
  ticks: number[];
}

function barAxis(maxValue: number): AxisScale {
  const step = roundStep(maxValue > 0 ? maxValue / BAR_FILL : AXIS_INTERVALS);
  return { max: step * AXIS_INTERVALS, ticks: Array.from({ length: AXIS_INTERVALS + 1 }, (_, i) => i * step) };
}

function ctrAxis(maxFrac: number): AxisScale {
  const step = roundStep(maxFrac > 0 ? maxFrac / LINE_FILL : 0.05);
  return { max: step * AXIS_INTERVALS, ticks: Array.from({ length: AXIS_INTERVALS + 1 }, (_, i) => i * step) };
}

function pctTick(frac: number): string {
  const v = frac * 100;
  return `${Number.isInteger(Math.round(v * 10) / 10) ? Math.round(v) : v.toFixed(1)}%`;
}

const chartConfig = {
  impressions: {
    label: "Impressions",
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

type MobileSingle = "impressions" | "clicks" | "ctr";

const MOBILE_SINGLE: { id: MobileSingle; label: string }[] = [
  { id: "impressions", label: METRIC_LABELS.impressions },
  { id: "clicks", label: METRIC_LABELS.clicks },
  { id: "ctr", label: METRIC_LABELS.ctr },
];

const AXIS_TICK = { fontSize: 11, fill: MUTED };
const AXIS_TITLE = { fontSize: 11, fontWeight: 700, fill: MUTED } as const;

/**
 * Pure delivery renderer on the shadcn chart pattern (recharts): desktop gets
 * a bars-and-line combo — view bars on the left axis, CTR line on the right —
 * and small screens get one metric at a time. Raw clicks (~2% of views) live
 * in the tooltip, never as same-axis bars. Display-only: every number arrives
 * backend-computed (AGENTS.md §6.1), already windowed to the requested range —
 * this component never slices or re-buckets. Toolbar, legend and empty state
 * belong to DeliveryChartSection.
 */
export function DeliveryChart({ data, title, metric }: DeliveryChartProps) {
  // Combo on a narrow screen falls back to one metric at a time: the dual
  // axes get cramped there, and the inner tabs pick which single series.
  const [mobileSingle, setMobileSingle] = useState<MobileSingle>("impressions");
  const mobileMetric: MobileSingle = metric === "combo" ? mobileSingle : metric;

  if (data.length === 0) return null;

  const rows: ChartRow[] = data.map((d) => ({
    label: d.label,
    views: d.impressions,
    clicks: d.clicks,
    ctr: d.impressions > 0 ? d.clicks / d.impressions : 0,
  }));
  const maxCtr = ctrAxis(Math.max(0, ...rows.map((r) => r.ctr)));
  const viewsAxis = barAxis(Math.max(0, ...rows.map((r) => r.views)));
  const clicksAxis = barAxis(Math.max(0, ...rows.map((r) => r.clicks)));
  const summary = data
    .map((d) => `${d.label}: ${formatCount(d.impressions)} impressions, ${formatCTR(d.clicks, d.impressions)} CTR`)
    .join(", ");

  return (
    <figure aria-label={`${title}. ${summary}`}>
      {/* Desktop charts */}
      <div className="hidden sm:block">
        {metric === "combo" && (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ComposedChart accessibilityLayer data={rows} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              {/* Dual axes are named ("views"/"ctr"), and the grid defaults to
                  axis 0 — point it at the left axis or it falls back to the
                  plot edges. Both axes share tick positions, so one set of
                  lines serves both. */}
              <CartesianGrid vertical={false} stroke={MIST} yAxisId="views" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
              <YAxis
                yAxisId="views"
                orientation="left"
                width={52}
                domain={[0, viewsAxis.max]}
                ticks={viewsAxis.ticks}
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
                domain={[0, maxCtr.max]}
                ticks={maxCtr.ticks}
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
                type="linear"
                stroke="var(--color-ctr)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: GOLD, stroke: "#fff", strokeWidth: 2 }}
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
                domain={[0, (metric === "clicks" ? clicksAxis : viewsAxis).max]}
                ticks={(metric === "clicks" ? clicksAxis : viewsAxis).ticks}
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
                domain={[0, maxCtr.max]}
                ticks={maxCtr.ticks}
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
                type="linear"
                stroke="var(--color-ctr)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: "var(--color-ctr)", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>

      {/* Small screens: one metric at a time */}
      <div className="sm:hidden">
        {metric === "combo" && (
          <div role="tablist" aria-label="Mobile chart metric" className="grid grid-cols-3 gap-1 rounded-lg bg-cloud p-1">
            {MOBILE_SINGLE.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`delivery-tab-${t.id}`}
                aria-selected={mobileSingle === t.id}
                aria-controls="delivery-panel"
                onClick={() => setMobileSingle(t.id)}
                className={`min-h-[44px] rounded-md px-3 py-2 text-sm font-medium ${
                  mobileSingle === t.id ? "bg-white text-ink shadow-sm" : "text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div role="tabpanel" id="delivery-panel" aria-labelledby={`delivery-tab-${mobileMetric}`} className="mt-3">
          {mobileMetric === "ctr" ? (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <LineChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={MIST} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tick={AXIS_TICK} />
                <YAxis
                  width={52}
                  domain={[0, maxCtr.max]}
                  ticks={maxCtr.ticks}
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
                  type="linear"
                  stroke="var(--color-ctr)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--color-ctr)", stroke: "#fff", strokeWidth: 2 }}
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
                  domain={[0, (mobileMetric === "clicks" ? clicksAxis : viewsAxis).max]}
                  ticks={(mobileMetric === "clicks" ? clicksAxis : viewsAxis).ticks}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => compact.format(v)}
                  tick={AXIS_TICK}
                  label={{
                    value: mobileMetric === "clicks" ? "Clicks" : "Views",
                    angle: -90,
                    position: "insideLeft",
                    offset: 6,
                    style: AXIS_TITLE,
                  }}
                />
                <ChartTooltip cursor={{ fill: MIST, opacity: 0.4 }} content={<DeliveryTooltipContent />} />
                <Bar
                  dataKey={mobileMetric === "clicks" ? "clicks" : "views"}
                  name={mobileMetric === "clicks" ? "Clicks" : "Views"}
                  fill={mobileMetric === "clicks" ? "var(--color-clicks)" : "var(--color-views)"}
                  radius={6}
                  maxBarSize={18}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </figure>
  );
}
