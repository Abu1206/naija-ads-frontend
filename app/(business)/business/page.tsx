import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { BarChart, type SeriesPoint } from "@/components/BarChart";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { formatCTR, formatCount, formatKobo } from "@/lib/format";
import type { AnalyticsSummary, Campaign } from "@/lib/types";

/**
 * Business dashboard home — spec §22: campaign performance, impressions, clicks,
 * CTR, spend, remaining budget, campaign status, format breakdown.
 */
export default async function BusinessOverviewPage() {
  const campaigns = await load<Campaign[]>(endpoints.campaigns);
  const analytics = await load<AnalyticsSummary>(analyticsFor("business"));

  const summary = analytics.data;
  const rows = campaigns.data ?? [];
  const series: SeriesPoint[] =
    summary?.series.map((point) => ({
      label: point.period.slice(0, 7),
      primary: point.impressions,
      secondary: point.clicks,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="How your campaigns are performing across the network."
        cta={{ href: "/business/campaigns/new", label: "New campaign" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          error={analytics.error}
        />
        <MetricCard
          label="Clicks"
          value={summary ? formatCount(summary.clicks) : "—"}
          icon="campaigns"
          error={analytics.error}
        />
        <MetricCard
          label="CTR"
          value={summary ? formatCTR(summary.clicks, summary.impressions) : "—"}
          icon="overview"
          error={analytics.error}
        />
        <MetricCard
          label="Spend"
          value={summary ? formatKobo(summary.spend_kobo) : "—"}
          hint={summary ? `${formatKobo(summary.remaining_budget_kobo)} left` : undefined}
          icon="billing"
          error={analytics.error}
        />
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Delivery</h2>
        {analytics.error ? (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {analytics.error}
          </p>
        ) : series.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-gray-500">
            No delivery yet. Data appears once a campaign is approved and funded.
          </p>
        ) : (
          <BarChart
            data={series}
            primaryLabel="Impressions"
            secondaryLabel="Clicks"
            ariaLabel="Impressions and clicks by month"
          />
        )}
      </section>

      <DataTable<Campaign>
        title="Campaign performance"
        action={
          <a href="/business/campaigns" className="text-sm font-medium text-brand-strong hover:underline">
            View all
          </a>
        }
        columns={[
          { key: "name", header: "Campaign", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "impressions", header: "Impressions", render: (c) => formatCount(c.impressions) },
          { key: "clicks", header: "Clicks", render: (c) => formatCount(c.clicks) },
          { key: "ctr", header: "CTR", render: (c) => formatCTR(c.clicks, c.impressions) },
          { key: "spend", header: "Spend", render: (c) => formatKobo(c.spend_kobo) },
        ]}
        rows={rows.slice(0, 5)}
        loading={false}
        error={campaigns.error}
        emptyMessage="No campaigns yet. Create one to start buying Nigerian inventory."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
