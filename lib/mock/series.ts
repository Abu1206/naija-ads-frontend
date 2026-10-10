// Deterministic stand-in for the backend's ranged series. The Go API owns the
// real buckets (AGENTS.md §4); this module generates fixture windows with the
// same shape so the chart section is verifiable while the backend is
// undeployed: 7D/30D daily, 90D weekly, 6M the monthly fixtures in data.ts.
//
// Fixture clock: the monthly fixtures run May–Oct 2026, so the last full day
// is 2026-10-08. Every daily point is a complete day — that is what removes
// the half-finished-October bar, not a special case in the chart.

export interface MockSeriesPoint {
  period: string;
  impressions: number;
  clicks: number;
}

/** Last full day in the fixture clock (see above). */
export const SERIES_END_ISO = "2026-10-08";

/** Days of daily history behind the windowed ranges. */
export const DAILY_HISTORY_DAYS = 182;

/** 90D renders as thirteen exact 7-day buckets. */
const WEEKLY_WEEKS = 13;
const DAYS_PER_WEEK = 7;

/** Deterministic PRNG so fixtures are stable across SSR and test runs. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDay(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Daily impressions with growth, a weekend dip and seeded noise, anchored so
 * recent days land near the monthly run-rate (~Sep daily average). Clicks ride
 * a gently varying CTR well below impressions — a day never out-clicks itself.
 */
export function generateDailySeries(
  seed: number,
  baseImpressions: number,
  baseCtr: number,
  endIso: string = SERIES_END_ISO,
  days: number = DAILY_HISTORY_DAYS,
): MockSeriesPoint[] {
  const rand = mulberry32(seed);
  const end = new Date(`${endIso}T00:00:00Z`);
  const points: MockSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const offset = i - (days - 1);
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() + offset);
    const dow = date.getUTCDay();
    const trend = 0.45 + 0.55 * (i / (days - 1));
    const weekend = dow === 0 || dow === 6 ? 0.72 : 1;
    const noise = 0.88 + 0.24 * rand();
    const impressions = Math.max(0, Math.round(baseImpressions * trend * weekend * noise));
    const ctr = baseCtr * (0.9 + 0.2 * rand());
    const clicks = Math.min(impressions, Math.round(impressions * ctr));
    points.push({ period: isoDay(end, offset), impressions, clicks });
  }
  return points;
}

/**
 * Daily spend attribution (kobo) aligned by index with a daily series: each
 * day's weight is its impressions with seeded noise, normalized so the whole
 * history sums exactly to the lifetime spend. Deterministic like the series
 * itself. This is the mock doing the backend's job (AGENTS.md §4): attributing
 * money per window so ranged reads can scope spend the way they scope counts.
 */
export function generateDailySpend(seed: number, daily: MockSeriesPoint[], totalKobo: number): number[] {
  const rand = mulberry32(seed);
  const weights = daily.map((p) => p.impressions * (0.85 + 0.3 * rand()));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const out = weights.map((w) => Math.round((w / weightSum) * totalKobo));
  out[out.length - 1]! += totalKobo - out.reduce((sum, v) => sum + v, 0);
  return out;
}

/**
 * Groups the trailing `weeks * 7` days into exact 7-day buckets labeled by
 * week-start date ("2026-09-28" renders as "28 Sep" via deliveryLabel). Exact
 * weeks keep every point a full 7 days — no ragged edge bucket.
 */
export function toWeekly(daily: MockSeriesPoint[], weeks: number = WEEKLY_WEEKS): MockSeriesPoint[] {
  const tail = daily.slice(-weeks * DAYS_PER_WEEK);
  const buckets: MockSeriesPoint[] = [];
  for (let w = 0; w < weeks; w++) {
    const chunk = tail.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK);
    if (chunk.length === 0) break;
    buckets.push({
      period: chunk[0]!.period,
      impressions: chunk.reduce((sum, p) => sum + p.impressions, 0),
      clicks: chunk.reduce((sum, p) => sum + p.clicks, 0),
    });
  }
  return buckets;
}
