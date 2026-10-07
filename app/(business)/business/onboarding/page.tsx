import { requireRole } from "@/lib/auth";

/**
 * Business onboarding: profile (name, country, phone, representative,
 * registration, website, vertical) then submit for manual verification.
 * Wiring lands with the backend profile endpoints.
 */
export default async function BusinessOnboardingPage() {
  await requireRole("business");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Set up your business profile</h1>
      <p className="text-sm text-gray-600">
        Complete your profile and submit it for a one-time manual verification. Campaigns unlock
        once approved.
      </p>
      <form className="space-y-4" action="#" method="post">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Business name
          </label>
          <input id="name" name="name" required className="mt-1 w-full rounded border px-3 py-2" />
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
        <div>
          <label htmlFor="vertical" className="block text-sm font-medium">
            Vertical
          </label>
          <input
            id="vertical"
            name="vertical"
            placeholder="e.g. food, investment"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
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
