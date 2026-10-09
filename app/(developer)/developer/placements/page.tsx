import { PageHeader } from "@/components/DashboardShell";
import { DataTable } from "@/components/DataTable";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { requireRole } from "@/lib/auth";
import { load } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { App, Placement } from "@/lib/types";

/**
 * Placements (spec §6.5): every placement belongs to one app and has an explicit
 * MVP format. Placement IDs come from the backend, never generated here.
 */
export default async function PlacementsPage() {
  await requireRole("developer");
  const [apps, placements] = await Promise.all([
    load<App[]>(endpoints.apps),
    load<Placement[]>(endpoints.placements),
  ]);

  const appOptions = (apps.data ?? []).map((app) => ({ value: app.app_id, label: app.name }));
  const nameById = new Map(appOptions.map((o) => [o.value, o.label]));

  const fields: ProfileField[] = [
    ...(appOptions.length > 0
      ? [{ name: "app_id", label: "App", type: "select" as const, required: true, options: appOptions }]
      : []),
    { name: "name", label: "Placement name", required: true, placeholder: "home_bottom" },
    {
      name: "ad_type",
      label: "Ad format",
      type: "select" as const,
      required: true,
      options: [
        { value: "banner", label: "Banner" },
        { value: "interstitial", label: "Interstitial" },
        { value: "rewarded", label: "Rewarded" },
        { value: "audio", label: "Audio" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placements"
        subtitle="Banner, interstitial, rewarded and audio slots per app — each gets its own PLACEMENT_ID."
      />

      <section className="rounded-card border border-mist bg-white p-6">
        <h2 className="mb-4 font-display font-semibold text-ink">Create a placement</h2>
        {appOptions.length === 0 ? (
          <p className="text-sm text-muted">
            {apps.error ??
              "Register an app first — placements are created inside an app. Head to Apps to get started."}
          </p>
        ) : (
          <ProfileForm
            endpoint={endpoints.placements}
            fields={fields}
            submitLabel="Create placement"
            successNote="Placement created. Your PLACEMENT_ID is listed below."
          />
        )}
      </section>

      <DataTable<Placement>
        title="Your placements"
        columns={[
          { key: "placement_id", header: "PLACEMENT_ID", render: (p) => <code className="text-xs">{p.placement_id}</code> },
          { key: "name", header: "Name", render: (p) => <span className="font-medium">{p.name}</span> },
          { key: "ad_type", header: "Format", render: (p) => p.ad_type },
          {
            key: "app_id",
            header: "App",
            render: (p) => nameById.get(p.app_id) ?? <code className="text-xs">{p.app_id}</code>,
          },
        ]}
        rows={placements.data ?? []}
        error={placements.error}
        emptyMessage="No placements yet. Create a placement for each format slot your app serves."
        getRowKey={(p) => p.placement_id}
      />
    </div>
  );
}
