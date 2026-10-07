import { requireRole } from "@/lib/auth";
import { MetricCard } from "@/components/MetricCard";
import { formatCTR, formatKobo } from "@/lib/format";

// Business analytics: impressions, clicks, CTR, spend, remaining, status and
// format breakdown — all backend-computed (GET /api/v1/analytics?scope=business).
export default async function BusinessAnalyticsPage() {
  await requireRole("business");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Impressions" value="—" />
        <MetricCard label="Clicks" value="—" />
        <MetricCard label="CTR" value={formatCTR(0, 0)} />
        <MetricCard label="Spend" value={formatKobo(0)} />
      </div>
      <p className="text-sm text-gray-600">
        Per-campaign and per-format breakdowns land with the analytics wiring.
      </p>
    </div>
  );
}
