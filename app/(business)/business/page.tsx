import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { DeliveryChart, type DeliveryPoint } from "@/components/DeliveryChart";
import { MetricCard } from "@/components/MetricCard";
import { SpendFooter } from "@/components/SpendFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { deliveryLabel, formatCTR, formatCount, formatKobo } from "@/lib/format";
import { attentionFlags, detectGrain, seriesDeltas } from "@/lib/insights";
import { AD_TYPES, type AnalyticsSummary, type Campaign } from "@/lib/types";

/**
 * Business dashboard home — spec §22: campaign performance, impressions, clicks,
 * CTR, spend, remaining budget, campaign status, format breakdown.
 *
 * This is the advertiser side of the network: it answers "which campaigns are
 * working, where is my budget going, and what needs my attention". Publishers
 * get the mirrored view at /developer (fill rate, eCPM, payouts).
 */
export default async function BusinessOverviewPage() {
  const campaigns = await load<Campaign[]>(endpoints.campaigns);
  const analytics = await load<AnalyticsSummary>(analyticsFor("business"));

  const summary = analytics.data;
  const rows = campaigns.data ?? [];
  const rawSeries = summary?.series ?? [];
  const grain = detectGrain(rawSeries.map((p) => p.period));
  const series: DeliveryPoint[] =
    rawSeries.map((point) => ({
      label: deliveryLabel(point.period),
      impressions: point.impressions,
      clicks: point.clicks,
    }));
  const deltas = seriesDeltas(rawSeries, deliveryLabel);
  const vsCaption = deltas.prevLabel ? `vs ${deltas.prevLabel}` : undefined;

  // Best-funded first: the campaigns eating the budget deserve the top rows.
  const topCampaigns = [...rows].sort((a, b) => b.spend_kobo - a.spend_kobo).slice(0, 5);
  const flags = attentionFlags(rows);

  const formats = summary?.by_format ?? {};
  const maxFormatImpressions = Math.max(
    0,
    ...AD_TYPES.map((f) => formats[f]?.impressions ?? 0),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="How your campaigns are performing across the network."
        cta={{ href: "/business/campaigns/new", label: "New campaign" }}
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          error={analytics.error}
          delta={deltas.impressions ? { ...deltas.impressions, caption: vsCaption } : null}
        />
        <MetricCard
          label="Clicks"
          value={summary ? formatCount(summary.clicks) : "—"}
          icon="campaigns"
          error={analytics.error}
          delta={deltas.clicks ? { ...deltas.clicks, caption: vsCaption } : null}
        />
        <MetricCard
          label="CTR"
          value={summary ? formatCTR(summary.clicks, summary.impressions) : "—"}
          icon="overview"
          error={analytics.error}
          delta={deltas.ctr ? { ...deltas.ctr, caption: vsCaption } : null}
        />
        <MetricCard
          label="Remaining budget"
          value={summary ? formatKobo(summary.remaining_budget_kobo) : "—"}
          icon="billing"
          tone="money"
          error={analytics.error}
          footer={
            summary ? (
              <SpendFooter spendKobo={summary.spend_kobo} remainingKobo={summary.remaining_budget_kobo} />
            ) : null
          }
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
        <DeliveryChart
          data={series}
          grain={grain}
          title="Delivery"
        />
      )}

      <DataTable<Campaign>
        title="Campaign performance"
        action={
          <a href="/business/campaigns" className="text-sm font-medium text-pine hover:underline">
            View all
          </a>
        }
        columns={[
          {
            key: "name",
            header: "Campaign",
            render: (c) => (
              <a
                href="/business/campaigns"
                aria-label={`View ${c.name} in campaigns`}
                className="font-medium text-pine hover:underline"
              >
                {c.name}
              </a>
            ),
          },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "impressions", header: "Impressions", numeric: true, render: (c) => formatCount(c.impressions) },
          { key: "clicks", header: "Clicks", numeric: true, render: (c) => formatCount(c.clicks) },
          { key: "ctr", header: "CTR", numeric: true, render: (c) => formatCTR(c.clicks, c.impressions) },
          { key: "spend", header: "Spend", numeric: true, render: (c) => formatKobo(c.spend_kobo) },
        ]}
        rows={topCampaigns}
        loading={false}
        error={campaigns.error}
        emptyMessage="No campaigns yet. Create one to start buying Nigerian inventory."
        getRowKey={(c) => c.id}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label="Needs attention" className="rounded-card border border-mist bg-white p-5">
          <h2 className="font-display font-semibold text-ink">Needs attention</h2>
          <p className="mt-0.5 text-sm text-muted">Campaigns asking for a decision.</p>
          {campaigns.error ? (
            <p role="alert" className="mt-4 rounded-lg border border-alert/30 bg-blush p-4 text-center text-sm text-alert">
              {campaigns.error}
            </p>
          ) : flags.length === 0 ? (
            <p className="mt-4 rounded-lg border border-mist p-4 text-center text-sm text-muted">
              All clear — every campaign is delivering or waiting its turn.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {flags.map(({ campaign, reason }) => (
                <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mist px-4 py-3">
                  <div className="min-w-0">
                    <a
                      href="/business/campaigns"
                      aria-label={`View ${campaign.name} in campaigns`}
                      className="block truncate text-sm font-medium text-pine hover:underline"
                    >
                      {campaign.name}
                    </a>
                    <p className="mt-0.5 text-xs text-muted">{reason}</p>
                  </div>
                  <StatusBadge status={campaign.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Delivery by format" className="rounded-card border border-mist bg-white p-5">
          <h2 className="font-display font-semibold text-ink">Delivery by format</h2>
          <p className="mt-0.5 text-sm text-muted">Where your impressions land.</p>
          {analytics.error ? (
            <p role="alert" className="mt-4 rounded-lg border border-alert/30 bg-blush p-4 text-center text-sm text-alert">
              {analytics.error}
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {AD_TYPES.map((format) => {
                const row = formats[format];
                const impressions = row?.impressions ?? 0;
                const share = maxFormatImpressions > 0 ? impressions / maxFormatImpressions : 0;
                return (
                  <li key={format}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-medium capitalize text-ink">{format}</span>
                      <span className="text-muted">
                        {row ? `${formatCount(impressions)} · ${formatCTR(row.clicks, impressions)} CTR` : "No delivery"}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-2 rounded-full bg-cloud"
                      role="progressbar"
                      aria-label={`${format} share of delivery`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(share * 100)}
                    >
                      <div className="h-full rounded-full bg-naija" style={{ width: `${share * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
