import { PageHeader } from "@/components/DashboardShell";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { requireRole } from "@/lib/auth";
import { endpoints } from "@/lib/endpoints";

// Spec §9.2 — the profile the advertiser submits for manual verification (§9.3).
const fields: ProfileField[] = [
  { name: "name", label: "Business name", required: true, placeholder: "Acme Foods Ltd" },
  { name: "industry", label: "Industry", required: true, placeholder: "Food & beverage" },
  { name: "website", label: "Website", type: "url", placeholder: "https://acme.ng" },
  { name: "location", label: "Location", required: true, placeholder: "Lagos, Nigeria" },
  {
    name: "description",
    label: "Business description",
    type: "textarea",
    placeholder: "What you sell and who you want to reach.",
  },
];

/** Business onboarding: profile + submit for one-time manual verification. */
export default async function BusinessOnboardingPage() {
  await requireRole("business");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business profile"
        subtitle="Campaigns unlock once an admin approves your verification."
      />
      <div className="rounded-xl border bg-white p-6">
        <ProfileForm
          endpoint={endpoints.businesses}
          fields={fields}
          submitLabel="Save and submit for verification"
          successNote="Profile saved. Verification is pending manual admin review."
        />
      </div>
    </div>
  );
}
