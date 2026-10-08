import { PageHeader } from "@/components/DashboardShell";
import { CampaignForm } from "@/components/CampaignForm";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { Creative } from "@/lib/types";

/**
 * Server wrapper so the guard and the read happen on the server; only the form
 * itself ships to the client (AGENTS.md §2).
 */
export default async function NewCampaignPage() {
  const { data, error } = await load<Creative[]>(endpoints.creatives);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New campaign"
        subtitle="Bids and floors are validated by the backend; bids below the effective floor are rejected at review."
      />
      <CampaignForm creatives={data ?? []} creativesError={error} />
    </div>
  );
}
