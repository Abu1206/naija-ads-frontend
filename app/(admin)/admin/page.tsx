import Link from "next/link";
import { PageHeader } from "@/components/DashboardShell";
import { Icon } from "@/components/Icon";
import { MetricCard } from "@/components/MetricCard";
import { load } from "@/lib/api";
import { analyticsFor } from "@/lib/endpoints";
import { formatCTR, formatCount, formatECPM, formatFillRate, formatKobo } from "@/lib/format";
import type { AnalyticsSummary } from "@/lib/types";

const QUEUES = [
  {
    href: "/admin/reviews",
    icon: "reviews",
    title: "Review queues",
    body: "Businesses, developers, apps, campaigns and creatives awaiting a human decision.",
  },
  {
    href: "/admin/payments",
    icon: "billing",
    title: "Payments and payouts",
    body: "Bachs records, ledger credits and manual payout approval.",
  },
  {
    href: "/admin/fraud",
    icon: "fraud",
    title: "Fraud alerts",
    body: "Request-rate, click-rate and reward-completion anomalies.",
  },
  {
    href: "/admin/audit",
    icon: "audit",
    title: "Audit logs",
    body: "Every financial and administrative action, attributable to an actor.",
  },
] as const;

/**
 * Admin network view — spec §22. Demand metrics come from the business analytics
 * scope and supply metrics from the developer scope; no `scope=admin` is invented
 * because the spec's API surface (§23) does not define one.
 */
export default async function AdminOverviewPage() {
  const demand = await load<AnalyticsSummary>(analyticsFor("business"));
  const supply = await load<AnalyticsSummary>(analyticsFor("developer"));

  const d = demand.data;
  const s = supply.data;
  const impressions = s ? formatCount(s.impressions) : "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Marketplace health across demand, supply and trust." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Advertiser spend"
          value={d ? formatKobo(d.spend_kobo) : "—"}
          icon="billing"
          error={demand.error}
        />
        <MetricCard
          label="Developer earnings"
          value={s ? formatKobo(s.revenue_kobo) : "—"}
          icon="earnings"
          error={supply.error}
        />
        <MetricCard
          label="Impressions"
          value={impressions}
          icon="analytics"
          error={supply.error}
        />
        <MetricCard
          label="Clicks"
          value={s ? formatCount(s.clicks) : "—"}
          icon="campaigns"
          error={supply.error}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Fill rate"
          value={s ? formatFillRate(s.filled, s.ad_requests) : "—"}
          icon="placements"
          error={supply.error}
        />
        <MetricCard
          label="eCPM"
          value={s ? formatECPM(s.revenue_kobo, s.impressions) : "—"}
          icon="overview"
          error={supply.error}
        />
        <MetricCard
          label="CTR"
          value={s ? formatCTR(s.clicks, s.impressions) : "—"}
          icon="analytics"
          error={supply.error}
        />
        <MetricCard
          label="Active campaigns"
          value="—"
          hint="needs a list total"
          icon="campaigns"
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {QUEUES.map((queue) => (
          <Link
            key={queue.href}
            href={queue.href}
            className="flex gap-4 rounded-xl border bg-white p-5 hover:border-brand"
          >
            <span className="h-fit rounded-lg bg-gray-100 p-2 text-brand">
              <Icon name={queue.icon} />
            </span>
            <span>
              <span className="block font-semibold">{queue.title}</span>
              <span className="mt-1 block text-sm text-gray-500">{queue.body}</span>
            </span>
          </Link>
        ))}
      </section>

      <p className="text-xs text-gray-500">
        Queue counts and network totals are not shown: the <code>/api/v1/admin</code> family (spec
        §23) has no documented aggregate endpoint, and lengthening a page of list results would
        report a page size as a network size.
      </p>
    </div>
  );
}
