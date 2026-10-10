import { PageHeader } from "@/components/DashboardShell";
import { CreativeUploader } from "@/components/CreativeUploader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { formatBytes, formatDate } from "@/lib/format";
import type { Campaign, Creative } from "@/lib/types";

function fileNameOf(url: string): string {
  const tail = url.split("/").pop() ?? url;
  return tail || url;
}

function dimensionsOf(c: Creative): string {
  if (c.ad_type === "audio") return "Audio";
  if (c.width && c.height) return `${c.width}×${c.height}`;
  return "—";
}

/** Creative library: upload via presigned R2, then human review before serving. */
export default async function CreativesPage() {
  const [{ data: creativeData, error: creativeError }, { data: campaignData }] = await Promise.all([
    load<Creative[]>(endpoints.creatives),
    load<Campaign[]>(endpoints.campaigns),
  ]);
  const creatives = creativeData ?? [];
  const campaignNames = new Map((campaignData ?? []).map((c) => [c.id, c.name]));
  const campaigns = (campaignData ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <PageHeader title="Creatives" subtitle="Upload the artwork each campaign will serve." />

      <Card>
        <CardHeader>
          <CardTitle>Upload a creative</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CreativeUploader campaigns={campaigns} />
        </CardContent>
      </Card>

      <DataTable<Creative>
        title="Your creatives"
        columns={[
          {
            key: "creative",
            header: "Creative",
            render: (c) => (
              <div className="min-w-0">
                <a
                  href={c.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-pine hover:underline"
                >
                  {fileNameOf(c.file_url)}
                </a>
                <p className="mt-0.5 text-xs text-muted">{dimensionsOf(c)}</p>
              </div>
            ),
          },
          {
            key: "campaign",
            header: "Campaign",
            render: (c) => campaignNames.get(c.campaign_id) ?? "—",
          },
          {
            key: "format",
            header: "Format",
            render: (c) => <span className="capitalize">{c.ad_type}</span>,
          },
          { key: "size", header: "Size", render: (c) => formatBytes(c.size_bytes) },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "created", header: "Uploaded", render: (c) => formatDate(c.created_at) },
        ]}
        rows={creatives}
        error={creativeError}
        emptyMessage="No creatives uploaded yet."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
