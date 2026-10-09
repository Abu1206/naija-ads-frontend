import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { DeliveryChart, type DeliveryPoint } from "@/components/DeliveryChart";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { deliveryLabel, formatCTR, formatCount, formatKobo } from "@/lib/format";
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
  const series: DeliveryPoint[] =
    summary?.series.map((point) => ({
      label: deliveryLabel(point.period),
      impressions: point.impressions,
      clicks: point.clicks,
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
          tone="money"
          error={analytics.error}
        />
      </div>

      {analytics.error ? (
        <p role="alert" className="rounded-lg border border-alert/30 bg-blush p-6 text-center text-alert">
          {analytics.error}
        </p>
      ) : series.length === 0 ? (
        <p className="rounded-lg border border-mist bg-white p-6 text-center text-muted">
          No delivery yet. Data appears once a campaign is approved and funded.
        </p>
      ) : (
        <DeliveryChart data={series} title="Delivery" description="Views and click-through rate by period." />
      )}

      <DataTable<Campaign>
        title="Campaign performance"
        action={
          <a href="/business/campaigns" className="text-sm font-medium text-pine hover:underline">
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
