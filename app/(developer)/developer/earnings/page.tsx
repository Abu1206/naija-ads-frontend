import { requireRole } from "@/lib/auth";
import { MetricCard } from "@/components/MetricCard";
import { formatFillRate } from "@/lib/format";

// Phase 6: estimated revenue (total + banner/interstitial/rewarded split) is
// backend-computed and displayed only.
export default async function EarningsPage() {
  await requireRole("developer");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Impressions" value="—" />
        <MetricCard label="Fill rate" value={formatFillRate(0, 0)} />
        <MetricCard label="Est. revenue" value="—" />
        <MetricCard label="Available" value="—" />
      </div>
    </div>
  );
}
