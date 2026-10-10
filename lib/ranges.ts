// Chart range + metric vocabulary, shared by the server pages (which fetch the
// window) and the client chart section (which writes the URL). Pure and
// server-safe: no component or navigation imports here.
//
// Ranges change the grain, not just the slice — that is the point. 7D/30D come
// back daily, 90D weekly, 6M monthly, so every plotted point is a full period
// and a half-finished current month never renders as a short bar (AGENTS.md
// §4: the backend owns buckets; the mock in lib/mock/series.ts stands in).

export const CHART_RANGES = ["7d", "30d", "90d", "6m"] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export const DEFAULT_RANGE: ChartRange = "30d";

export const RANGE_LABELS: Record<ChartRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "6m": "Last 6 months",
};

/**
 * Caption for window-vs-window deltas: the equal-length span immediately
 * before the selected one. "vs previous 30 days" must describe the real
 * comparison — an advertiser should never have to guess what a delta is
 * measured against.
 */
export const RANGE_COMPARISON: Record<ChartRange, string> = {
  "7d": "vs previous 7 days",
  "30d": "vs previous 30 days",
  "90d": "vs previous 90 days",
  "6m": "vs previous 6 months",
};

export type SeriesGrain = "daily" | "weekly" | "monthly";

/** The grain the backend serves for each range — the chart renders it as-is. */
export function grainForRange(range: ChartRange): SeriesGrain {
  switch (range) {
    case "7d":
    case "30d":
      return "daily";
    case "90d":
      return "weekly";
    case "6m":
      return "monthly";
  }
}

/** Unknown, missing or repeated params fall back to the default window. */
export function parseChartRange(value: unknown): ChartRange {
  return typeof value === "string" &&
    (CHART_RANGES as readonly string[]).includes(value)
    ? (value as ChartRange)
    : DEFAULT_RANGE;
}

export const CHART_METRICS = ["combo", "impressions", "clicks", "ctr"] as const;
export type ChartMetric = (typeof CHART_METRICS)[number];

export const DEFAULT_METRIC: ChartMetric = "combo";

export const METRIC_LABELS: Record<ChartMetric, string> = {
  combo: "Combo",
  impressions: "Impressions",
  clicks: "Clicks",
  ctr: "CTR",
};

export function parseChartMetric(value: unknown): ChartMetric {
  return typeof value === "string" &&
    (CHART_METRICS as readonly string[]).includes(value)
    ? (value as ChartMetric)
    : DEFAULT_METRIC;
}

/**
 * A brand-new campaign with fewer than this many points in the window shows
 * the empty state instead of one lonely dot.
 */
export const MIN_SERIES_POINTS = 3;
