import Link from "next/link";

/**
 * Signup entry: pick a role, then continue with Google (the backend's only
 * sign-in method — POST /api/v1/auth/google). Wiring lands with the auth build.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const role = (await searchParams)?.role === "business" ? "business" : "developer";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Join Naija Ads</h1>
      <div className="flex rounded border p-1 text-sm" role="group" aria-label="Account type">
        <Link
          href="/signup?role=business"
          aria-current={role === "business" ? "page" : undefined}
          className={`flex-1 rounded px-3 py-2 text-center font-medium ${
            role === "business" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Business
        </Link>
        <Link
          href="/signup?role=developer"
          aria-current={role === "developer" ? "page" : undefined}
          className={`flex-1 rounded px-3 py-2 text-center font-medium ${
            role === "developer" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Developer
        </Link>
      </div>
      <p className="text-sm text-gray-600">
        {role === "business"
          ? "Advertise in Nigerian apps: campaigns, creatives, funding via Bachs."
          : "Monetize your app: register apps, create placements, earn per category."}
      </p>
      <button
        type="button"
        className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Continue with Google
      </button>
      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
        .
      </p>
    </div>
  );
}
