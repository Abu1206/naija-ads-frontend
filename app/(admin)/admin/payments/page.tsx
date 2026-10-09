import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { ReviewDecision } from "@/components/ReviewDecision";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { adminEndpoints, analyticsFor } from "@/lib/endpoints";
import { formatDate, formatKobo } from "@/lib/format";
import type { AnalyticsSummary, Payment, Payout } from "@/lib/types";

/**
 * Admin money view (spec §22): Bachs payment records, manual payout approval and
 * the two network-level totals. Spend and earnings are read from the analytics
 * scopes, never added up from the rows below.
 */
export default async function AdminPaymentsPage() {
  await requireRole("admin");

  const [payments, payouts, demand, supply] = await Promise.all([
    load<Payment[]>(adminEndpoints.payments),
    load<Payout[]>(adminEndpoints.payouts),
    load<AnalyticsSummary>(analyticsFor("business")),
    load<AnalyticsSummary>(analyticsFor("developer")),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments and payouts"
        subtitle="Funding in, revenue out — both confirmed server-side."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Advertiser spend"
          value={demand.data ? formatKobo(demand.data.spend_kobo) : "—"}
          icon="billing"
          tone="money"
          error={demand.error}
        />
        <MetricCard
          label="Developer earnings"
          value={supply.data ? formatKobo(supply.data.revenue_kobo) : "—"}
          icon="earnings"
          tone="money"
          error={supply.error}
        />
      </div>

      <p className="text-xs text-muted">
        A payment stays <code>pending</code> until the Bachs webhook confirms it server-side; the
        redirect back to this dashboard is not a credit (spec §16.3).
      </p>

      <DataTable<Payment>
        title="Payments"
        columns={[
          { key: "reference", header: "Reference", render: (p) => <code className="text-xs">{p.reference}</code> },
          { key: "business_id", header: "Business", render: (p) => <code className="text-xs">{p.business_id}</code> },
          { key: "amount", header: "Amount", numeric: true, render: (p) => formatKobo(p.amount_kobo) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "created_at", header: "Created", render: (p) => formatDate(p.created_at) },
        ]}
        rows={payments.data ?? []}
        error={payments.error}
        emptyMessage="No payment records yet."
        getRowKey={(p) => p.id}
      />

      <DataTable<Payout>
        title="Payout requests"
        columns={[
          { key: "developer_id", header: "Developer", render: (p) => <code className="text-xs">{p.developer_id}</code> },
          { key: "amount", header: "Amount", numeric: true, render: (p) => formatKobo(p.amount_kobo) },
          { key: "requested", header: "Requested", render: (p) => formatDate(p.requested_at) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          {
            key: "review",
            header: "Decision",
            render: (p) =>
              p.status === "paid" || p.status === "rejected" ? (
                <span className="text-xs text-muted">Closed</span>
              ) : (
                <ReviewDecision kind="payout" id={p.id} />
              ),
          },
        ]}
        rows={payouts.data ?? []}
        error={payouts.error}
        emptyMessage="No payout requests yet."
        getRowKey={(p) => p.id}
      />
    </div>
  );
}
