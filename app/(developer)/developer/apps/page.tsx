import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { StatusBadge } from "@/components/StatusBadge";
import { requireRole } from "@/lib/auth";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { formatDate } from "@/lib/format";
import type { App } from "@/lib/types";

// Spec §6.4 — app name, platform, category, package identifier, age rating.
// The backend answers with the APP_ID and SDK credentials; the privileged half
// of those keys is never rendered here (AGENTS.md §6.3).
const fields: ProfileField[] = [
  { name: "name", label: "App name", required: true, placeholder: "Lagos Run" },
  {
    name: "platform",
    label: "Platform",
    type: "select",
    required: true,
    options: [
      { value: "android", label: "Android (first-class SDK)" },
      { value: "web", label: "Web" },
    ],
  },
  { name: "category", label: "Category", required: true, placeholder: "Games / casual" },
  {
    name: "package_name",
    label: "Package or bundle identifier",
    required: true,
    placeholder: "com.example.lagosrun",
  },
  { name: "age_rating", label: "Age rating", required: true, placeholder: "Everyone" },
];

/** Developer apps: register an app, then read back the APP_IDs issued by the backend. */
export default async function AppsPage() {
  await requireRole("developer");
  const apps = await load<App[]>(endpoints.apps);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apps"
        subtitle="Each registered app gets an APP_ID for NaijaAds.initialize()."
        cta={{ href: "/developer/placements", label: "Manage placements" }}
      />

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold">Register an app</h2>
        <ProfileForm
          endpoint={endpoints.apps}
          fields={fields}
          submitLabel="Create app"
          successNote="App created. Your APP_ID is listed below."
        />
      </section>

      <DataTable<App>
        title="Your apps"
        columns={[
          { key: "name", header: "App", render: (a) => <span className="font-medium">{a.name}</span> },
          { key: "app_id", header: "APP_ID", render: (a) => <code className="text-xs">{a.app_id}</code> },
          { key: "platform", header: "Platform", render: (a) => a.platform },
          { key: "category", header: "Category", render: (a) => a.category },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
          { key: "created_at", header: "Registered", render: (a) => formatDate(a.created_at) },
        ]}
        rows={apps.data ?? []}
        error={apps.error}
        emptyMessage="No apps yet. Register your first app to get an APP_ID."
        getRowKey={(a) => a.app_id}
      />
    </div>
  );
}
