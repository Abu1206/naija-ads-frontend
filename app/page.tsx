import type { Metadata } from "next";
import Link from "next/link";
import { getRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Naija Ads — Advertise in Nigerian apps, earn from your app",
  description:
    "A two-sided ad network for Nigeria. Businesses run banner, interstitial, rewarded, and audio campaigns. Developers monetize apps with per-category revenue shares.",
};

const ROLE_HOME = {
  business: "/business",
  developer: "/developer",
  admin: "/admin",
} as const;

/** Landing + role router: signed-in users go straight to their dashboard. */
export default async function Home() {
  const role = await getRole();
  if (role) redirect(ROLE_HOME[role]);

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Nigeria&apos;s ad network for apps and games</h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Businesses reach real Nigerian audiences in-app. Developers turn traffic into revenue.
          One auction, transparent CPM floors, human-reviewed everything.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/advertisers"
            className="rounded bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Advertise
          </Link>
          <Link
            href="/developers"
            className="rounded border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
          >
            Monetize your app
          </Link>
          <Link href="/login" className="text-sm text-gray-600 underline">
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="font-medium">Four formats</p>
          <p className="text-sm text-gray-600">
            Banner, interstitial, rewarded video, and audio — each with its own floor.
          </p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="font-medium">CPM honesty</p>
          <p className="text-sm text-gray-600">
            Per-category bids, capped budgets with pacing. Delivery estimated, never guaranteed.
          </p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="font-medium">Trust by default</p>
          <p className="text-sm text-gray-600">
            Manual verification, server-validated rewards, fraud controls on every event.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Start in minutes</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tutorials/first-campaign" className="underline">
            Launch your first campaign →
          </Link>
          <Link href="/tutorials/first-placement" className="underline">
            Monetize your first placement →
          </Link>
          <Link href="/docs" className="underline">
            Read the developer docs →
          </Link>
        </div>
      </section>
    </div>
  );
}
