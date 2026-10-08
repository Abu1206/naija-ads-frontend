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

/**
 * Form-input unit conversion only: an advertiser types naira, the API takes kobo.
 * This never derives spend, revenue or a balance — those arrive kobo-denominated
 * from the backend and are displayed, not computed (AGENTS.md §6.1).
 */
export function nairaInputToKobo(naira: number): number {
  return Math.round(naira * 100);
}
