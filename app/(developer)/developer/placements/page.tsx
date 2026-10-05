import { requireRole } from "@/lib/auth";
import { DataTable } from "@/components/DataTable";
import type { Placement } from "@/lib/types";

export default async function PlacementsPage() {
  await requireRole("developer");
  const placements: Placement[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Placements</h1>
      <DataTable<Placement>
        columns={[
          { key: "name", header: "Name", render: (p) => p.name },
          { key: "ad_type", header: "Format", render: (p) => p.ad_type },
          { key: "app", header: "App", render: (p) => <code>{p.app_id}</code> },
        ]}
        rows={placements}
        emptyMessage="No placements yet. Create banner, interstitial, or rewarded placements per app."
        getRowKey={(p) => p.placement_id}
      />
    </div>
  );
}
