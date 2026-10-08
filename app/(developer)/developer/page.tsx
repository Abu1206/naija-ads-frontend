import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { formatCount, formatECPM, formatFillRate, formatKobo } from "@/lib/format";
import type { AnalyticsSummary, DeveloperEarning, Payout } from "@/lib/types";

/**
 * Developer dashboard home — spec §22: app, impressions, fill rate, estimated
 * revenue with per-format split, pending vs available earnings, payout status.
 */
export default async function DeveloperOverviewPage() {
  const analytics = await load<AnalyticsSummary>(analyticsFor("developer"));
  const earnings = await load<DeveloperEarning[]>(endpoints.earnings);
  const payouts = await load<Payout[]>(endpoints.payouts);

  const summary = analytics.data;
  const formats = summary?.by_format ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Inventory health and revenue across your apps."
        cta={{ href: "/developer/apps", label: "Register app" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Impressions"
          value={summary ? formatCount(summary.impressions) : "—"}
          icon="analytics"
          error={analytics.error}
        />
        <MetricCard
          label="Fill rate"
          value={summary ? formatFillRate(summary.filled, summary.ad_requests) : "—"}
          icon="placements"
          error={analytics.error}
        />
        <MetricCard
          label="Estimated revenue"
          value={summary ? formatKobo(summary.revenue_kobo) : "—"}
          icon="earnings"
          error={analytics.error}
        />
        <MetricCard
          label="eCPM"
          value={summary ? formatECPM(summary.revenue_kobo, summary.impressions) : "—"}
          icon="overview"
          error={analytics.error}
        />
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Revenue by format</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {(["banner", "interstitial", "rewarded"] as const).map((format) => (
            <div key={format} className="rounded-lg border p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 capitalize">
                {format}
              </dt>
              <dd className="mt-1 text-xl font-semibold">
                {formats[format] ? formatKobo(formats[format]!.revenue_kobo) : "—"}
              </dd>
              <dd className="text-xs text-gray-500">
                {formats[format] ? `${formatCount(formats[format]!.impressions)} impressions` : "No data"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Pending earnings"
          value="—"
          hint="awaiting a backend aggregate"
          icon="earnings"
        />
        <MetricCard
          label="Available earnings"
          value="—"
          hint="awaiting a backend aggregate"
          icon="payouts"
        />
      </div>
      <p className="text-xs text-gray-500">
        Pending vs available is an aggregate the API surface (spec §23) does not expose yet — it is
        deliberately blank rather than summed in the browser.
      </p>

      <DataTable<DeveloperEarning>
        title="Earnings by app"
        columns={[
          { key: "app_id", header: "App", render: (e) => <code className="text-xs">{e.app_id}</code> },
          { key: "ad_type", header: "Format", render: (e) => e.ad_type },
          { key: "impressions", header: "Impressions", render: (e) => formatCount(e.impressions) },
          { key: "revenue", header: "Revenue", render: (e) => formatKobo(e.revenue_kobo) },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
        ]}
        rows={earnings.data ?? []}
        error={earnings.error}
        emptyMessage="No earnings recorded yet."
        getRowKey={(e) => e.id}
      />

      <DataTable<Payout>
        title="Payouts"
        action={
          <a href="/developer/payouts" className="text-sm font-medium text-brand-strong hover:underline">
            View all
          </a>
        }
        columns={[
          { key: "requested", header: "Requested", render: (p) => formatKobo(p.amount_kobo) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        ]}
        rows={(payouts.data ?? []).slice(0, 5)}
        error={payouts.error}
        emptyMessage="No payout requests yet."
        getRowKey={(p) => p.id}
      />
    </div>
  );
}
