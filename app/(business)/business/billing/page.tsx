import Link from "next/link";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import { FundForm } from "@/components/FundForm";
import { StatusBadge } from "@/components/StatusBadge";
import { WalletCard } from "@/components/WalletCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      {analytics.error && (
        <p role="alert" className="rounded-lg border border-alert/30 bg-blush p-4 text-center text-sm text-alert">
          {analytics.error}
        </p>
      )}

      {/* A matching pair: the wallet card and its lifetime twin share the same
          frame, label, numeral and hint line — the only difference is the
          wallet's funding action. */}
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <WalletCard
          label="Remaining budget"
          balance={analytics.data ? formatKobo(analytics.data.remaining_budget_kobo) : "—"}
          hint="Available to spend now."
          action={
            <Link href="#add-funds">
              <Button variant="gold">Fund wallet</Button>
            </Link>
          }
        />
        <WalletCard
          label="Total spend"
          balance={analytics.data ? formatKobo(analytics.data.spend_kobo) : "—"}
          hint="Lifetime, across all campaigns."
        />
      </div>

      <Card id="add-funds" className="scroll-mt-4">
        <CardHeader>
          <CardTitle>Add funds</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FundForm />
        </CardContent>
      </Card>

      <DataTable<Payment>
        title="Payments"
        columns={[
          { key: "reference", header: "Reference", render: (p) => <code className="text-xs">{p.reference}</code> },
          { key: "amount", header: "Amount", numeric: true, render: (p) => formatKobo(p.amount_kobo) },
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
