import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { formatCTR, formatCount, formatKobo } from "@/lib/format";
import type { Campaign } from "@/lib/types";

/** Campaign list with the §22 per-campaign metrics and §12 review status. */
export default async function CampaignsPage() {
  const { data, error } = await load<Campaign[]>(endpoints.campaigns);
  const campaigns = data ?? [];

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
    }),
    { impressions: 0, clicks: 0 },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Every campaign you have submitted, with its review state."
        cta={{ href: "/business/campaigns/new", label: "New campaign" }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Campaigns" value={error ? "—" : formatCount(campaigns.length)} icon="campaigns" error={error} />
        <MetricCard label="Impressions" value={error ? "—" : formatCount(totals.impressions)} icon="analytics" error={error} />
        <MetricCard
          label="CTR"
          value={error ? "—" : formatCTR(totals.clicks, totals.impressions)}
          icon="overview"
          error={error}
        />
      </div>

      <DataTable<Campaign>
        columns={[
          { key: "name", header: "Campaign", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "format", header: "Format", render: (c) => c.ad_type },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "impressions", header: "Impressions", render: (c) => formatCount(c.impressions) },
          { key: "clicks", header: "Clicks", render: (c) => formatCount(c.clicks) },
          { key: "ctr", header: "CTR", render: (c) => formatCTR(c.clicks, c.impressions) },
          { key: "spend", header: "Spend", render: (c) => formatKobo(c.spend_kobo) },
          {
            key: "remaining",
            header: "Remaining",
            render: (c) => formatKobo(c.remaining_budget_kobo),
          },
        ]}
        rows={campaigns}
        error={error}
        emptyMessage="No campaigns yet. Create your first campaign to start advertising."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
