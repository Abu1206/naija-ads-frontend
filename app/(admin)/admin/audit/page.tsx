import { requireRole } from "@/lib/auth";

export default async function AuditPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit logs</h1>
      <p className="text-gray-600">No audit events yet.</p>
    </div>
  );
}
