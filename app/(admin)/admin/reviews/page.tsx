import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { ReviewDecision } from "@/components/ReviewDecision";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { adminEndpoints } from "@/lib/endpoints";
import { formatDate, formatKobo } from "@/lib/format";
import type {
  App,
  Business,
  Campaign,
  Creative,
  Developer,
} from "@/lib/types";

/**
 * Admin review queues (spec §22): the three verification queues from §6.3 / §9.3
 * plus campaign and creative moderation from §12. Reads hit the assumed
 * `/api/v1/admin/...` paths in lib/endpoints.ts; the decision POST is one shared
 * endpoint the backend owns.
 */
export default async function ReviewsPage() {
  await requireRole("admin");

  const [businesses, developers, apps, campaigns, creatives] = await Promise.all([
    load<Business[]>(adminEndpoints.businesses),
    load<Developer[]>(adminEndpoints.developers),
    load<App[]>(adminEndpoints.apps),
    load<Campaign[]>(adminEndpoints.campaigns),
    load<Creative[]>(adminEndpoints.creatives),
  ]);

  const decision = (kind: Parameters<typeof ReviewDecision>[0]["kind"], id: string) => (
    <ReviewDecision kind={kind} id={id} />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review queues"
        subtitle="Every account, app and ad that reaches the network passes a human here."
      />

      <DataTable<Business>
        title="Business verification"
        columns={[
          { key: "name", header: "Business", render: (b) => <span className="font-medium">{b.name}</span> },
          { key: "industry", header: "Industry", render: (b) => b.industry },
          { key: "location", header: "Location", render: (b) => b.location },
          { key: "status", header: "Status", render: (b) => <StatusBadge status={b.verification_status} /> },
          { key: "review", header: "Decision", render: (b) => decision("business", b.id) },
        ]}
        rows={businesses.data ?? []}
        error={businesses.error}
        emptyMessage="No businesses awaiting verification."
        getRowKey={(b) => b.id}
      />

      <DataTable<Developer>
        title="Developer verification"
        columns={[
          { key: "display_name", header: "Developer", render: (d) => <span className="font-medium">{d.display_name}</span> },
          { key: "profile_type", header: "Type", render: (d) => d.profile_type },
          { key: "country_code", header: "Country", render: (d) => d.country_code },
          { key: "status", header: "Status", render: (d) => <StatusBadge status={d.verification_status} /> },
          { key: "review", header: "Decision", render: (d) => decision("developer", d.id) },
        ]}
        rows={developers.data ?? []}
        error={developers.error}
        emptyMessage="No developers awaiting verification."
        getRowKey={(d) => d.id}
      />

      <DataTable<App>
        title="App review"
        columns={[
          { key: "name", header: "App", render: (a) => <span className="font-medium">{a.name}</span> },
          { key: "app_id", header: "APP_ID", render: (a) => <code className="text-xs">{a.app_id}</code> },
          { key: "platform", header: "Platform", render: (a) => a.platform },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
          { key: "review", header: "Decision", render: (a) => decision("app", a.app_id) },
        ]}
        rows={apps.data ?? []}
        error={apps.error}
        emptyMessage="No apps awaiting review."
        getRowKey={(a) => a.app_id}
      />

      <DataTable<Campaign>
        title="Campaign review"
        columns={[
          { key: "name", header: "Campaign", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "ad_type", header: "Format", render: (c) => c.ad_type },
          { key: "budget", header: "Budget", numeric: true, render: (c) => formatKobo(c.total_budget_kobo) },
          { key: "created", header: "Submitted", render: (c) => formatDate(c.created_at) },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "review", header: "Decision", render: (c) => decision("campaign", c.id) },
        ]}
        rows={campaigns.data ?? []}
        error={campaigns.error}
        emptyMessage="No campaigns awaiting review."
        getRowKey={(c) => c.id}
      />

      <DataTable<Creative>
        title="Creative review"
        columns={[
          { key: "id", header: "Creative", render: (c) => <code className="text-xs">{c.id}</code> },
          { key: "campaign_id", header: "Campaign", render: (c) => <code className="text-xs">{c.campaign_id}</code> },
          { key: "ad_type", header: "Format", render: (c) => c.ad_type },
          { key: "dimensions", header: "Size", render: (c) => `${c.width}×${c.height}` },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "review", header: "Decision", render: (c) => decision("creative", c.id) },
        ]}
        rows={creatives.data ?? []}
        error={creatives.error}
        emptyMessage="No creatives awaiting review."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
