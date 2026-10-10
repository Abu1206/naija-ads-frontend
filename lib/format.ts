// Display-only formatters. All money math happens server-side; the client
// formats backend-computed kobo ints and ratios. Never compute spend/revenue here.

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

/** 100000 kobo -> ₦1,000.00 */
export function formatKobo(kobo: number): string {
  return NGN.format(kobo / 100);
}

function ratio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}

/** clicks/impressions as "2.50%". 0 impressions -> "—". */
export function formatCTR(clicks: number, impressions: number): string {
  const r = ratio(clicks, impressions);
  return r === null ? "—" : `${(r * 100).toFixed(2)}%`;
}

/** revenue/impressions*1000 as "₦1,234.50". 0 impressions -> "—". */
export function formatECPM(revenueKobo: number, impressions: number): string {
  const r = ratio(revenueKobo, impressions);
  if (r === null) return "—";
  return NGN.format((r * 1000) / 100);
}

/** filled/requests as "95.00%". 0 requests -> "—". */
export function formatFillRate(filled: number, requests: number): string {
  const r = ratio(filled, requests);
  return r === null ? "—" : `${(r * 100).toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

/** 1284 -> "1,284". Backend counts only; never used to derive a count. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

/** 48210 -> "47.1 KB", 8421000 -> "8.0 MB". Backend bytes only, display only. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export type DeltaDirection = "up" | "down" | "flat";

export interface Delta {
  text: string;
  direction: DeltaDirection;
}

/**
 * Relative change of `current` against `previous`. Null when there is no
 * baseline (previous <= 0) — callers render no comparison rather than a
 * misleading 0% or infinite lift.
 */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
    return null;
  }
  return (current - previous) / previous;
}

/**
 * Compact "↑ 9.6%" comparison for KPI cards. Counts and ratios only — never
 * money: spend context comes from backend-computed kobo amounts plus the
 * display-only utilization bar below, not from a derived delta.
 */
export function formatDelta(current: number, previous: number): Delta | null {
  const change = percentChange(current, previous);
  if (change === null) return null;
  const magnitude = `${(Math.abs(change) * 100).toFixed(1)}%`;
  if (Math.abs(change) < 0.0005) return { text: `→ ${magnitude}`, direction: "flat" };
  return change > 0
    ? { text: `↑ ${magnitude}`, direction: "up" }
    : { text: `↓ ${magnitude}`, direction: "down" };
}

/**
 * Display-only budget share for the utilization bar. The kobo amounts stay
 * backend-computed (AGENTS.md §6.1) — this derives no money value, only the
 * 0..1 fill fraction. Null when there is no budget to split.
 */
export function budgetUtilization(spendKobo: number, remainingKobo: number): number | null {
  if (!Number.isFinite(spendKobo) || !Number.isFinite(remainingKobo)) return null;
  if (spendKobo < 0 || remainingKobo < 0) return null;
  const total = spendKobo + remainingKobo;
  if (total <= 0) return null;
  return spendKobo / total;
}

/** 0.073 -> "7.3% used". No budget -> "—". */
export function formatUtilization(spendKobo: number, remainingKobo: number): string {
  const share = budgetUtilization(spendKobo, remainingKobo);
  return share === null ? "—" : `${formatShare(share)} used`;
}

/** Display-only share for inline use next to a bar. Null -> "—". */
export function formatShare(share: number | null): string {
  if (share === null || !Number.isFinite(share)) return "—";
  return `${(share * 100).toFixed(1)}%`;
}

/**
 * Chart period labels. Period strings arrive backend-owned ("2026-10" today,
 * "2026-10-03" once the daily grain lands). Monthly labels shorten to "May";
 * daily ones to "3 Oct" for axis duty. Pure and server-safe: it lives
 * here (not in the client chart module) so server pages can map the backend
 * series before rendering.
 */
export function deliveryLabel(period: string): string {
  const daily = /^(\d{4})-(\d{2})-(\d{2})/.exec(period);
  if (daily) {
    const d = new Date(`${daily[1]}-${daily[2]}-${daily[3]}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    }
    return period;
  }
  const monthly = /^(\d{4})-(\d{2})/.exec(period);
  if (monthly) {
    const d = new Date(`${monthly[1]}-${monthly[2]}-01T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-NG", { month: "short" });
    }
  }
  return period;
}

/**
 * Form-input unit conversion only: an advertiser types naira, the API takes kobo.
 * This never derives spend, revenue or a balance — those arrive kobo-denominated
 * from the backend and are displayed, not computed (AGENTS.md §6.1).
 */
export function nairaInputToKobo(naira: number): number {
  return Math.round(naira * 100);
}
