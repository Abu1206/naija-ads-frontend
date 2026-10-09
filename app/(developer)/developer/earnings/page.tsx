import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { formatCount, formatKobo } from "@/lib/format";
import type { AnalyticsSummary, DeveloperEarning, EarningStatus } from "@/lib/types";

// Spec §17: ad revenue -> platform share -> developer share -> PENDING ->
// VALIDATED -> AVAILABLE -> PAYOUT REQUESTED -> PROCESSING -> PAID.
const LADDER: EarningStatus[] = [
  "pending",
  "validated",
  "available",
  "payout_requested",
  "processing",
  "paid",
];

/**
 * Earnings ledger. The §22 pending/available *totals* are deliberately blank:
 * §23 exposes no balance aggregate, and summing earnings rows in the browser
 * would be client-side money math (AGENTS.md §6.1).
 */
export default async function EarningsPage() {
  await requireRole("developer");
  const [earnings, analytics] = await Promise.all([
    load<DeveloperEarning[]>(endpoints.earnings),
    load<AnalyticsSummary>(analyticsFor("developer")),
  ]);

  const rows = earnings.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" subtitle="Your revenue share, per app and per format." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Estimated revenue"
          value={analytics.data ? formatKobo(analytics.data.revenue_kobo) : "—"}
          icon="earnings"
          tone="money"
          error={analytics.error}
        />
        <MetricCard label="Pending earnings" value="—" hint="needs a backend total" icon="overview" />
        <MetricCard label="Available earnings" value="—" hint="needs a backend total" icon="payouts" />
        <MetricCard
          label="Ledger rows"
          value={rows.length > 0 ? formatCount(rows.length) : "—"}
          icon="audit"
          error={earnings.error}
        />
      </div>

      <section className="rounded-card border border-mist bg-white p-5">
        <h2 className="mb-4 font-display font-semibold text-ink">Earnings status</h2>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LADDER.map((status) => (
            <li key={status} className="rounded-lg border border-mist p-3">
              <StatusBadge status={status} />
              <p className="mt-2 text-xs text-muted">
                {rows.length === 0
                  ? "No records"
                  : `${formatCount(rows.filter((e) => e.status === status).length)} row(s)`}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Counts group the rows this page already has. Amounts per stage come from the backend.
        </p>
      </section>

      <DataTable<DeveloperEarning>
        title="Earnings ledger"
        columns={[
          { key: "period", header: "Period", render: (e) => e.period },
          { key: "app_id", header: "App", render: (e) => <code className="text-xs">{e.app_id}</code> },
          { key: "ad_type", header: "Format", render: (e) => e.ad_type },
          { key: "impressions", header: "Impressions", numeric: true, render: (e) => formatCount(e.impressions) },
          { key: "revenue", header: "Revenue", numeric: true, render: (e) => formatKobo(e.revenue_kobo) },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
        ]}
        rows={rows}
        error={earnings.error}
        emptyMessage="No earnings recorded yet."
        getRowKey={(e) => e.id}
      />
    </div>
  );
}
