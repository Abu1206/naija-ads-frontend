import { PageHeader } from "@/components/DashboardShell";
import { BarChart, type SeriesPoint } from "@/components/BarChart";
import { MetricCard } from "@/components/MetricCard";
import { load } from "@/lib/api";
import { analyticsFor } from "@/lib/endpoints";
import { formatCTR, formatCount, formatKobo } from "@/lib/format";
import type { AnalyticsSummary } from "@/lib/types";

/** Impressions, clicks, CTR, spend and format breakdown — all backend-computed. */
export default async function BusinessAnalyticsPage() {
  const { data: summary, error } = await load<AnalyticsSummary>(analyticsFor("business"));

  const series: SeriesPoint[] =
    summary?.series.map((point) => ({
      label: point.period.slice(0, 7),
      primary: point.impressions,
      secondary: point.clicks,
    })) ?? [];

  const formats = summary?.by_format ?? {};

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Delivery and spend reported by the ad server." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Impressions" value={summary ? formatCount(summary.impressions) : "—"} icon="analytics" error={error} />
        <MetricCard label="Clicks" value={summary ? formatCount(summary.clicks) : "—"} icon="campaigns" error={error} />
        <MetricCard label="CTR" value={summary ? formatCTR(summary.clicks, summary.impressions) : "—"} icon="overview" error={error} />
        <MetricCard label="Spend" value={summary ? formatKobo(summary.spend_kobo) : "—"} icon="billing" error={error} />
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Impressions and clicks</h2>
        {error ? (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </p>
        ) : series.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-gray-500">Nothing to chart yet.</p>
        ) : (
          <BarChart data={series} primaryLabel="Impressions" secondaryLabel="Clicks" ariaLabel="Delivery over time" />
        )}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Format breakdown</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {(["banner", "interstitial", "rewarded"] as const).map((format) => {
            const row = formats[format];
            return (
              <div key={format} className="rounded-lg border p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 capitalize">
                  {format}
                </dt>
                <dd className="mt-1 text-xl font-semibold">
                  {row ? formatCount(row.impressions) : "—"}
                </dd>
                <dd className="text-xs text-gray-500">
                  {row ? `${formatCTR(row.clicks, row.impressions)} CTR` : "No delivery"}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
    </div>
  );
}
