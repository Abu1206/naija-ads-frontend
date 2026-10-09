import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { adminEndpoints } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import type { FraudAlert } from "@/lib/types";

// Spec §18: fraud detection flags anomalies; holding earnings and pausing
// accounts are admin actions taken from this view, never automatic here.
const KIND_LABELS: Record<FraudAlert["kind"], string> = {
  request_rate: "Ad request rate",
  click_rate: "Click rate",
  reward_completion: "Reward completion",
  traffic_spike: "Traffic spike",
};

/** Fraud alerts — detection lives in the Go server; this page only surfaces it. */
export default async function FraudPage() {
  await requireRole("admin");
  const alerts = await load<FraudAlert[]>(adminEndpoints.fraudAlerts);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud alerts"
        subtitle="Anomalies the detection rules flagged for a human to judge."
      />

      <DataTable<FraudAlert>
        title="Open alerts"
        columns={[
          { key: "severity", header: "Severity", render: (a) => <StatusBadge status={a.severity} /> },
          { key: "kind", header: "Signal", render: (a) => KIND_LABELS[a.kind] },
          { key: "subject", header: "Subject", render: (a) => <code className="text-xs">{a.subject}</code> },
          { key: "detail", header: "Detail", render: (a) => a.detail },
          { key: "created_at", header: "Detected", render: (a) => formatDate(a.created_at) },
        ]}
        rows={alerts.data ?? []}
        error={alerts.error}
        emptyMessage="No open fraud alerts."
        getRowKey={(a) => a.id}
      />

      <p className="text-xs text-muted">
        Rewards are validated server-side (§8.3), so a client can never claim a completion — the
        alerts above flag patterns, and holding an earning stays a backend decision.
      </p>
    </div>
  );
}
