import { PageHeader } from "@/components/DashboardShell";
import { DeliveryChart, type DeliveryPoint } from "@/components/DeliveryChart";
import { MetricCard } from "@/components/MetricCard";
import { SpendFooter } from "@/components/SpendFooter";
import { load } from "@/lib/api";
import { analyticsFor } from "@/lib/endpoints";
import { deliveryLabel, formatCTR, formatCount, formatKobo } from "@/lib/format";
import { detectGrain, seriesDeltas } from "@/lib/insights";
import type { AnalyticsSummary } from "@/lib/types";
import { AD_TYPES } from "@/lib/types";

/** Impressions, clicks, CTR, spend and format breakdown — all backend-computed. */
export default async function BusinessAnalyticsPage() {
  const { data: summary, error } = await load<AnalyticsSummary>(analyticsFor("business"));

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

  const formats = summary?.by_format ?? {};

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Delivery and spend reported by the ad server." />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          error={error}
          delta={deltas.impressions ? { ...deltas.impressions, caption: vsCaption } : null}
        />
        <MetricCard
          label="Clicks"
          value={summary ? formatCount(summary.clicks) : "—"}
          icon="campaigns"
          error={error}
          delta={deltas.clicks ? { ...deltas.clicks, caption: vsCaption } : null}
        />
        <MetricCard
          label="CTR"
          value={summary ? formatCTR(summary.clicks, summary.impressions) : "—"}
          icon="overview"
          error={error}
          delta={deltas.ctr ? { ...deltas.ctr, caption: vsCaption } : null}
        />
        <MetricCard
          label="Remaining budget"
          value={summary ? formatKobo(summary.remaining_budget_kobo) : "—"}
          icon="billing"
          tone="money"
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
      ) : series.length === 0 ? (
        <p className="rounded-lg border border-mist bg-white p-6 text-center text-muted">Nothing to chart yet.</p>
      ) : (
        <DeliveryChart
          data={series}
          grain={grain}
          title="Impressions and CTR"
        />
      )}

      <section className="rounded-card border border-mist bg-white p-5">
        <h2 className="mb-4 font-display font-semibold text-ink">Format breakdown</h2>
        <dl className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {AD_TYPES.map((format) => {
            const row = formats[format];
            return (
              <div key={format} className="rounded-lg border border-mist p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted capitalize">
                  {format}
                </dt>
                <dd className="mt-1 text-xl font-semibold">
                  {row ? formatCount(row.impressions) : "—"}
                </dd>
                <dd className="text-xs text-muted">
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
