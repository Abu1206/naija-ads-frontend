import { requireRole } from "@/lib/auth";
import { MetricCard } from "@/components/MetricCard";
import { formatECPM } from "@/lib/format";

export default async function AdminPaymentsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Advertiser spend" value="—" />
        <MetricCard label="Developer earnings" value="—" />
        <MetricCard label="eCPM" value={formatECPM(0, 0)} />
      </div>
    </div>
  );
}
