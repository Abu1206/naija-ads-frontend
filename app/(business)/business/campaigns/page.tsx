import { requireRole } from "@/lib/auth";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCTR, formatKobo } from "@/lib/format";
import type { Campaign } from "@/lib/types";

// Phase 1 shell: wired to GET /api/v1/campaigns once the backend is live.
// Server component for reads per AGENTS.md §2.
export default async function CampaignsPage() {
  await requireRole("business");
  const campaigns: Campaign[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <a
          href="/business/campaigns/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          New campaign
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Impressions" value="—" />
        <MetricCard label="Clicks" value="—" />
        <MetricCard label="CTR" value={formatCTR(0, 0)} />
      </div>
      <DataTable<Campaign>
        columns={[
          { key: "name", header: "Name", render: (c) => c.name },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "spend", header: "Spend", render: (c) => formatKobo(c.spend_kobo) },
          { key: "budget", header: "Budget", render: (c) => formatKobo(c.budget_kobo) },
        ]}
        rows={campaigns}
        emptyMessage="No campaigns yet. Create your first campaign to start advertising."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
