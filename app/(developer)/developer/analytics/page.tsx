import { PageHeader } from "@/components/DashboardShell";
import { DeliveryChartSection } from "@/components/DeliveryChartSection";
import type { DeliveryPoint } from "@/components/DeliveryChart";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { deliveryLabel, formatCount, formatECPM, formatFillRate, formatKobo } from "@/lib/format";
import { parseChartMetric, parseChartRange, RANGE_LABELS } from "@/lib/ranges";
import type { AnalyticsSummary, App, DeveloperEarning } from "@/lib/types";
import { AD_TYPES } from "@/lib/types";

/**
 * Developer analytics (spec §22): impressions, fill rate, estimated revenue and
 * the banner/interstitial/rewarded/audio split — all backend-computed and displayed only.
 */
export default async function DeveloperAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("developer");
  const params = await searchParams;
  const range = parseChartRange(params.range);
  const metric = parseChartMetric(params.metric);
  const [analytics, apps, earnings, allTime] = await Promise.all([
    load<AnalyticsSummary>(analyticsFor("developer", range)),
    load<App[]>(endpoints.apps),
    load<DeveloperEarning[]>(endpoints.earnings),
    // Lifetime money + request totals for the ratio tiles: the fixtures carry
    // no daily revenue/request attribution (and money is never derived
    // client-side), so fill rate and eCPM stay all-time until the backend
    // serves windowed revenue — then this collapses back to one load.
    load<AnalyticsSummary>(analyticsFor("developer")),
  ]);

  const summary = analytics.data;
  const totals = allTime.data;
  const formats = summary?.by_format ?? {};
  const appNames = new Map((apps.data ?? []).map((a) => [a.app_id, a.name]));
  const series: DeliveryPoint[] =
    summary?.series.map((point) => ({
      label: deliveryLabel(point.period),
      impressions: point.impressions,
      clicks: point.clicks,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Delivery and revenue across every app you monetize."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          hint={RANGE_LABELS[range]}
          error={analytics.error}
        />
        <MetricCard
          label="Ad requests"
          value={totals ? formatCount(totals.ad_requests) : "—"}
          icon="placements"
          hint="All-time"
          error={analytics.error}
        />
        <MetricCard
          label="Fill rate"
          value={totals ? formatFillRate(totals.filled, totals.ad_requests) : "—"}
          icon="overview"
          hint="All-time"
          error={analytics.error}
        />
        <MetricCard
          label="eCPM"
          value={totals ? formatECPM(totals.revenue_kobo, totals.impressions) : "—"}
          icon="earnings"
          hint="All-time"
          error={analytics.error}
        />
      </div>

      {analytics.error ? (
        <p role="alert" className="rounded-lg border border-alert/30 bg-blush p-6 text-center text-alert">
          {analytics.error}
        </p>
      ) : (
        <DeliveryChartSection
          key={`${range}-${metric}`}
          data={series}
          title="Delivery"
          range={range}
          metric={metric}
        />
      )}

      <section className="rounded-card border border-mist bg-white p-5">
        <h2 className="mb-4 font-display font-semibold text-ink">Revenue by format</h2>
        <dl className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {AD_TYPES.map((format) => (
            <div key={format} className="rounded-lg border border-mist p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted capitalize">
                {format}
              </dt>
              <dd className="mt-1 text-xl font-semibold">
                {formats[format] ? formatKobo(formats[format]!.revenue_kobo) : "—"}
              </dd>
              <dd className="text-xs text-muted">
                {formats[format]
                  ? `${formatCount(formats[format]!.impressions)} impressions`
                  : "No data"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <DataTable<DeveloperEarning>
        title="Per-app performance"
        columns={[
          {
            key: "app_id",
            header: "App",
            render: (e) => appNames.get(e.app_id) ?? <code className="text-xs">{e.app_id}</code>,
          },
          { key: "period", header: "Period", render: (e) => e.period },
          { key: "ad_type", header: "Format", render: (e) => e.ad_type },
          { key: "impressions", header: "Impressions", numeric: true, render: (e) => formatCount(e.impressions) },
          { key: "revenue", header: "Revenue", numeric: true, render: (e) => formatKobo(e.revenue_kobo) },
        ]}
        rows={earnings.data ?? []}
        error={earnings.error}
        emptyMessage="No earnings rows yet."
        getRowKey={(e) => e.id}
      />
    </div>
  );
}
