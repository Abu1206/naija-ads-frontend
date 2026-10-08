import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { FundForm } from "@/components/FundForm";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { analyticsFor, endpoints } from "@/lib/endpoints";
import { formatDate, formatKobo } from "@/lib/format";
import type { AnalyticsSummary, Payment } from "@/lib/types";

/**
 * Funding and ledger view (spec §15, §16). Credits land only after the verified
 * Bachs webhook, so a `pending` row is expected and is not a failed payment.
 */
export default async function BillingPage() {
  const payments = await load<Payment[]>(endpoints.payments);
  const analytics = await load<AnalyticsSummary>(analyticsFor("business"));

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="Fund your account and audit every credit and debit." />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Balance" value="—" hint="needs a wallet aggregate" icon="billing" />
        <MetricCard
          label="Total spend"
          value={analytics.data ? formatKobo(analytics.data.spend_kobo) : "—"}
          icon="campaigns"
          error={analytics.error}
        />
        <MetricCard
          label="Remaining budget"
          value={analytics.data ? formatKobo(analytics.data.remaining_budget_kobo) : "—"}
          icon="overview"
          error={analytics.error}
        />
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-1 font-semibold">Add funds</h2>
        <p className="mb-4 text-sm text-gray-500">
          You will be redirected to a Bachs checkout created by the backend. Your balance updates
          when the webhook confirms the payment, never from the redirect alone.
        </p>
        <FundForm />
      </section>

      <DataTable<Payment>
        title="Payments"
        columns={[
          { key: "reference", header: "Reference", render: (p) => <code className="text-xs">{p.reference}</code> },
          { key: "amount", header: "Amount", render: (p) => formatKobo(p.amount_kobo) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "created", header: "Created", render: (p) => formatDate(p.created_at) },
        ]}
        rows={payments.data ?? []}
        error={payments.error}
        emptyMessage="No funding attempts yet."
        getRowKey={(p) => p.id}
      />
    </div>
  );
}
