import { requireRole } from "@/lib/auth";
import { DataTable } from "@/components/DataTable";
import type { App } from "@/lib/types";

// Phase 2: register app -> backend returns APP_ID + SDK creds (secret shown once).
export default async function AppsPage() {
  await requireRole("developer");
  const apps: App[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Apps</h1>
        <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white">
          Register app
        </button>
      </div>
      <DataTable<App>
        columns={[
          { key: "name", header: "Name", render: (a) => a.name },
          { key: "app_id", header: "APP_ID", render: (a) => <code>{a.app_id}</code> },
          { key: "platform", header: "Platform", render: (a) => a.platform },
          { key: "status", header: "Status", render: (a) => a.status },
        ]}
        rows={apps}
        emptyMessage="No apps yet. Register your first app to get an APP_ID."
        getRowKey={(a) => a.app_id}
      />
    </div>
  );
}
