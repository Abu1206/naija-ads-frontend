import { PageHeader } from "@/components/DashboardShell";
import { CampaignStatusFilter } from "@/components/CampaignStatusFilter";
import { parseStatusFilter } from "@/lib/campaignStatus";
import { DataTable } from "@/components/DataTable";
import { DeliveryChartSection } from "@/components/DeliveryChartSection";
import type { DeliveryPoint } from "@/components/DeliveryChart";
import { MetricCard } from "@/components/MetricCard";
import { SpendFooter } from "@/components/SpendFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import {
  deliveryLabel,
  formatCTR,
  formatCount,
  formatDelta,
  formatKobo,
  formatShare,
} from "@/lib/format";
import { windowDeltas } from "@/lib/insights";
import { parseChartMetric, parseChartRange, RANGE_COMPARISON, RANGE_LABELS } from "@/lib/ranges";
import type { AnalyticsSummary, Campaign } from "@/lib/types";
import { AD_TYPES } from "@/lib/types";

/** Spec §22 advertiser analytics: windowed impressions, clicks, CTR and spend
 * with deltas, the point-in-time wallet, delivery chart, per-campaign
 * performance with a status filter, and the all-time format split. Money
 * arrives backend-computed and is only displayed.
 */
export default async function BusinessAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const range = parseChartRange(params.range);
  const metric = parseChartMetric(params.metric);
  const status = parseStatusFilter(params.status);
  const [analytics, campaignLoad, lifetimeLoad] = await Promise.all([
    load<AnalyticsSummary>(analyticsFor("business", range)),
    load<Campaign[]>(endpoints.campaigns),
    // Format cells are lifetime (no per-format attribution in the fixtures),
    // so they need the all-time denominator for their share. Skipped when the
    // selected window already is all-time.
    range === "all"
      ? Promise.resolve({ data: null as AnalyticsSummary | null, error: null as string | null })
      : load<AnalyticsSummary>(analyticsFor("business", "all")),
  ]);
  const { data: summary, error } = analytics;

  const rawSeries = summary?.series ?? [];
  const series: DeliveryPoint[] =
    rawSeries.map((point) => ({
      label: deliveryLabel(point.period),
      impressions: point.impressions,
      clicks: point.clicks,
    }));
  // Window-vs-window baseline: the selected window against the equal-length
  // one before it, named in the caption (spec §22 delta tiles). Spend compares
  // against its own baseline the same way.
  const deltas = windowDeltas(rawSeries, summary?.previous_window ?? null);
  const spendDelta = summary
    ? formatDelta(summary.spend_kobo, summary.previous_window?.spend_kobo ?? 0)
    : null;
  const vsCaption = summary?.previous_window ? RANGE_COMPARISON[range] : undefined;

  // Campaign rows are lifetime: the fixtures carry no per-campaign window
  // attribution, and only the backend may attribute delivery. Sorted by
  // delivery, best first, then narrowed to the selected status.
  const campaigns = [...(campaignLoad.data ?? [])]
    .sort((a, b) => b.impressions - a.impressions)
    .filter((c) => status === "all" || c.status === status);
  const lifetime = range === "all" ? summary : (lifetimeLoad.data ?? summary);
  const formats = lifetime?.by_format ?? {};
  const lifetimeImpressions = lifetime?.impressions ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Delivery and spend reported by the ad server." />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          hint={RANGE_LABELS[range]}
          error={error}
          delta={deltas.impressions ? { ...deltas.impressions, caption: vsCaption } : null}
        />
        <MetricCard
          label="Clicks"
          value={summary ? formatCount(summary.clicks) : "—"}
          icon="campaigns"
          hint={RANGE_LABELS[range]}
          error={error}
          delta={deltas.clicks ? { ...deltas.clicks, caption: vsCaption } : null}
        />
        <MetricCard
          label="CTR"
          value={summary ? formatCTR(summary.clicks, summary.impressions) : "—"}
          icon="overview"
          hint={RANGE_LABELS[range]}
          error={error}
          delta={deltas.ctr ? { ...deltas.ctr, caption: vsCaption } : null}
        />
        <MetricCard
          label="Spend"
          value={summary ? formatKobo(summary.spend_kobo) : "—"}
          icon="payouts"
          tone="money"
          hint={RANGE_LABELS[range]}
          error={error}
          delta={spendDelta ? { ...spendDelta, caption: vsCaption } : null}
        />
        <MetricCard
          label="Remaining budget"
          value={summary ? formatKobo(summary.remaining_budget_kobo) : "—"}
          icon="billing"
          tone="money"
          hint="Available now"
          error={error}
          footer={
            summary ? (
              <SpendFooter spendKobo={summary.spend_kobo} remainingKobo={summary.remaining_budget_kobo} />
            ) : null
          }
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-alert/30 bg-blush p-6 text-center text-alert">
          {error}
        </p>
      ) : (
        <DeliveryChartSection
          key={`${range}-${metric}`}
          data={series}
          title="Impressions and CTR"
          range={range}
          metric={metric}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Format breakdown</CardTitle>
          <CardDescription>All-time totals</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <dl className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {AD_TYPES.map((format) => {
              const row = formats[format];
              const share = lifetimeImpressions > 0 && row ? row.impressions / lifetimeImpressions : null;
              return (
                <div key={format} className="rounded-lg border border-mist p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted capitalize">
                    {format}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
                    {row ? formatCount(row.impressions) : "—"}
                  </dd>
                  <dd className="mt-0.5 text-xs text-muted">
                    {row
                      ? `${formatCTR(row.clicks, row.impressions)} CTR · ${formatShare(share)} of impressions`
                      : "No delivery"}
                  </dd>
                  {share !== null && (
                    <dd
                      className="mt-2 h-1 overflow-hidden rounded-full bg-cloud"
                      role="img"
                      aria-label={`${format} share of impressions: ${formatShare(share)}`}
                    >
                      <span
                        className="block h-full rounded-full bg-naija"
                        style={{ width: `${Math.min(100, share * 100)}%` }}
                        aria-hidden="true"
                      />
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </CardContent>
      </Card>

      <DataTable<Campaign>
        title="Campaign performance"
        action={<CampaignStatusFilter value={status} />}
        columns={[
          { key: "name", header: "Campaign", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "impressions", header: "Impressions", numeric: true, render: (c) => formatCount(c.impressions) },
          { key: "clicks", header: "Clicks", numeric: true, render: (c) => formatCount(c.clicks) },
          { key: "ctr", header: "CTR", numeric: true, render: (c) => formatCTR(c.clicks, c.impressions) },
          { key: "spend", header: "Spend", numeric: true, render: (c) => formatKobo(c.spend_kobo) },
          {
            key: "remaining",
            header: "Remaining",
            numeric: true,
            render: (c) => formatKobo(c.remaining_budget_kobo),
          },
        ]}
        rows={campaigns}
        error={campaignLoad.error}
        emptyMessage={
          status === "all"
            ? "No campaigns yet. Create your first campaign to start advertising."
            : "No campaigns with this status."
        }
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
