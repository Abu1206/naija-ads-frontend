import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { adminEndpoints } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

/**
 * Audit trail (spec §19 audit_logs, §27 every financial and admin action is
 * attributable): read-only by design — nothing on this page can be edited.
 */
export default async function AuditPage() {
  await requireRole("admin");
  const logs = await load<AuditLog[]>(adminEndpoints.auditLogs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        subtitle="Who did what, to which object, and when."
      />

      <DataTable<AuditLog>
        title="Recent events"
        columns={[
          { key: "created_at", header: "When", render: (l) => formatDate(l.created_at) },
          { key: "actor", header: "Actor", render: (l) => <span className="font-medium">{l.actor}</span> },
          { key: "action", header: "Action", render: (l) => l.action },
          { key: "target", header: "Target", render: (l) => <code className="text-xs">{l.target}</code> },
        ]}
        rows={logs.data ?? []}
        error={logs.error}
        emptyMessage="No audit events yet."
        getRowKey={(l) => l.id}
      />

      <p className="text-xs text-gray-500">
        Verification decisions, funding credits, payout approvals and fraud holds all land here —
        the frontend only reads them.
      </p>
    </div>
  );
}
