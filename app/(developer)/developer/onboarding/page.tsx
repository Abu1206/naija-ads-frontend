import { PageHeader } from "@/components/DashboardShell";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { requireRole } from "@/lib/auth";
import { endpoints } from "@/lib/endpoints";

// Spec §6.2 profile + §6.3 verification details. Payout information lives on the
// payouts page, not here: the spec keeps it separate from identity data (§17).
const fields: ProfileField[] = [
  { name: "display_name", label: "Display name", required: true, placeholder: "Ada's Games" },
  {
    name: "profile_type",
    label: "Profile type",
    type: "select",
    required: true,
    options: [
      { value: "individual", label: "Individual" },
      { value: "studio", label: "Company / studio" },
    ],
  },
  {
    name: "studio_name",
    label: "Studio name",
    placeholder: "Only for company / studio accounts",
  },
  { name: "website", label: "Website", type: "url", placeholder: "https://example.ng" },
  { name: "country_code", label: "Country", required: true, placeholder: "NG" },
];

/** Developer onboarding: profile + submit for one-time manual verification. */
export default async function DeveloperOnboardingPage() {
  await requireRole("developer");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer profile"
        subtitle="App registration unlocks once an admin approves your verification."
      />
      <div className="rounded-card border border-mist bg-white p-6">
        <ProfileForm
          endpoint={endpoints.developers}
          fields={fields}
          submitLabel="Save and submit for verification"
          successNote="Profile saved. Verification is pending manual admin review."
        />
      </div>
    </div>
  );
}
