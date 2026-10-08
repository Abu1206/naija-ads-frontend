import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { PayoutRequestForm } from "@/components/PayoutRequestForm";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { StatusBadge } from "@/components/StatusBadge";
import { requireRole } from "@/lib/auth";
import { load } from "@/lib/api";
import { endpoints, payoutEndpoints } from "@/lib/endpoints";
import { formatDate, formatKobo } from "@/lib/format";
import type { Payout } from "@/lib/types";

// Stored apart from ad-event data (spec §17). The field names mirror the
// developer_payout_accounts entity (§19); the backend owns the final contract.
const accountFields: ProfileField[] = [
  { name: "bank_name", label: "Bank", required: true, placeholder: "Guaranty Trust Bank" },
  { name: "account_name", label: "Account name", required: true, placeholder: "Ada Okonkwo" },
  { name: "account_number", label: "Account number", required: true, placeholder: "0123456789" },
];

/**
 * Payouts (spec §17): MVP payouts are manually approved, so this page shows the
 * request ladder and nothing more — the admin queue drives the outcome.
 */
export default async function PayoutsPage() {
  await requireRole("developer");
  const payouts = await load<Payout[]>(endpoints.payouts);

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" subtitle="Request a withdrawal and track it through review." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold">Payout account</h2>
          <ProfileForm
            endpoint={payoutEndpoints.account}
            fields={accountFields}
            submitLabel="Save payout account"
            successNote="Payout account saved."
          />
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold">Request a payout</h2>
          <PayoutRequestForm />
          <p className="mt-4 text-xs text-gray-500">
            Requests enter admin review before any transfer. The backend decides whether the amount
            clears your available balance — this dashboard never checks it.
          </p>
        </section>
      </div>

      <DataTable<Payout>
        title="Payout history"
        columns={[
          { key: "amount", header: "Amount", render: (p) => formatKobo(p.amount_kobo) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "requested_at", header: "Requested", render: (p) => formatDate(p.requested_at) },
          {
            key: "paid_at",
            header: "Paid",
            render: (p) => (p.paid_at ? formatDate(p.paid_at) : "—"),
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
