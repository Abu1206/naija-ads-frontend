import Link from "next/link";
import { ProfileForm, type ProfileField } from "@/components/ProfileForm";
import { endpoints } from "@/lib/endpoints";

// Spec §6.1 (developer) and §9.1 (business) signup fields. There is no separate
// auth-signup path in §23: the account is created through the role's own
// collection endpoint, which is also where the profile pages post.
function fields(nameLabel: string, namePlaceholder: string): ProfileField[] {
  return [
    { name: "name", label: nameLabel, required: true, placeholder: namePlaceholder },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "you@business.ng" },
    { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "+234 801 234 5678" },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "country_code", label: "Country", required: true, placeholder: "NG" },
  ];
}

const ROLES = {
  business: {
    label: "Business",
    endpoint: endpoints.businesses,
    heading: "Advertise in Nigerian apps: campaigns, creatives, funding via Bachs.",
    nameLabel: "Business name",
    namePlaceholder: "Acme Foods Ltd",
  },
  developer: {
    label: "Developer",
    endpoint: endpoints.developers,
    heading: "Monetize your app: register apps, create placements, earn per category.",
    nameLabel: "Name",
    namePlaceholder: "Ada Okonkwo",
  },
} as const;

/** Signup entry: pick a role, then create the account on that role's endpoint. */
export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const role = (await searchParams)?.role === "business" ? "business" : "developer";
  const config = ROLES[role];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Join Naija Ads</h1>

      <div className="flex rounded-lg border border-mist p-1 text-sm" role="group" aria-label="Account type">
        {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((key) => (
          <Link
            key={key}
            href={`/signup?role=${key}`}
            aria-current={role === key ? "page" : undefined}
            className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-3 py-2 text-center font-medium ${
              role === key ? "bg-naija text-white" : "text-muted hover:bg-cloud"
            }`}
          >
            {ROLES[key].label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted">{config.heading}</p>

      <ProfileForm
        endpoint={config.endpoint}
        fields={fields(config.nameLabel, config.namePlaceholder)}
        submitLabel={`Create ${config.label.toLowerCase()} account`}
        successNote="Account created — you can log in now. Verification is a separate, manual step."
      />

      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
        .
      </p>
    </div>
  );
}
