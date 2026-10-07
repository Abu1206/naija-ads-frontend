import { requireRole } from "@/lib/auth";
import { MetricCard } from "@/components/MetricCard";
import { formatECPM, formatFillRate } from "@/lib/format";

// Developer analytics: per-app impressions, fill rate, revenue split by format —
// all backend-computed (GET /api/v1/analytics?scope=developer).
export default async function DeveloperAnalyticsPage() {
  await requireRole("developer");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Impressions" value="—" />
        <MetricCard label="Fill rate" value={formatFillRate(0, 0)} />
        <MetricCard label="eCPM" value={formatECPM(0, 0)} />
        <MetricCard label="Est. revenue" value="—" />
      </div>
      <p className="text-sm text-gray-600">
        Per-app and per-format breakdowns land with the analytics wiring.
      </p>
    </div>
  );
}
