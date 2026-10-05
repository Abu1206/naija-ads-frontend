import { getRole } from "@/lib/auth";
import { redirect } from "next/navigation";

const ROLE_HOME = {
  business: "/business/campaigns",
  developer: "/developer/apps",
  admin: "/admin/reviews",
} as const;

/** Landing / role router: signed-in users go to their dashboard. */
export default async function Home() {
  const role = await getRole();
  if (role) redirect(ROLE_HOME[role]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Naija Ads</h1>
      <p className="text-gray-600">
        Businesses run campaigns. Developers monetize apps. Admins keep the marketplace safe.
      </p>
      <a
        href="/login"
        className="inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Log in
      </a>
    </div>
  );
}
