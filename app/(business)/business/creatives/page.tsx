import { PageHeader } from "@/components/DashboardShell";
import { CreativeUploader } from "@/components/CreativeUploader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import type { Creative } from "@/lib/types";

/** Creative library: upload via presigned R2, then human review before serving. */
export default async function CreativesPage() {
  const { data, error } = await load<Creative[]>(endpoints.creatives);

  return (
    <div className="space-y-6">
      <PageHeader title="Creatives" subtitle="Upload the artwork each campaign will serve." />

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Upload a creative</h2>
        <CreativeUploader />
      </section>

      <DataTable<Creative>
        title="Your creatives"
        columns={[
          { key: "id", header: "ID", render: (c) => <code className="text-xs">{c.id}</code> },
          { key: "format", header: "Format", render: (c) => c.ad_type },
          {
            key: "dimensions",
            header: "Dimensions",
            render: (c) => (c.width && c.height ? `${c.width}×${c.height}` : "—"),
          },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "created", header: "Uploaded", render: (c) => formatDate(c.created_at) },
        ]}
        rows={data ?? []}
        error={error}
        emptyMessage="No creatives uploaded yet."
        getRowKey={(c) => c.id}
      />
    </div>
  );
}
