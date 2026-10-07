import { requireRole } from "@/lib/auth";

/**
 * Developer onboarding: profile (display name, country, phone, individual vs
 * studio) then submit for manual verification. Mirrors backend profile fields.
 */
export default async function DeveloperOnboardingPage() {
  await requireRole("developer");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Set up your developer profile</h1>
      <p className="text-sm text-gray-600">
        Complete your profile and submit it for a one-time manual verification. App registration
        unlocks once approved.
      </p>
      <form className="space-y-4" action="#" method="post">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium">
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="country_code" className="block text-sm font-medium">
            Country code
          </label>
          <input
            id="country_code"
            name="country_code"
            required
            placeholder="NG"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Profile type</legend>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="profile_type" value="individual" required /> Individual
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="profile_type" value="studio" /> Studio
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save and submit for verification
        </button>
      </form>
    </div>
  );
}
