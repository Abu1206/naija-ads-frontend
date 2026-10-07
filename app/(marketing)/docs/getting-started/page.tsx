import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getting started — Naija Ads docs",
  description: "Sign in with Google, verify your developer profile, register an app, and get an APP_ID.",
};

export default function GettingStartedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Getting started</h1>
      <ol className="space-y-3">
        <li className="rounded border bg-white p-4">
          <p className="font-medium">1. Sign in with Google</p>
          <p className="text-sm text-gray-600">
            Google sign-in only. Your session lives in an httpOnly cookie — never in localStorage.
          </p>
        </li>
        <li className="rounded border bg-white p-4">
          <p className="font-medium">2. Complete your developer profile</p>
          <p className="text-sm text-gray-600">
            Display name, country, phone, and profile type (individual or studio) at{" "}
            <code>/developer/onboarding</code>, then submit for a one-time manual verification.
          </p>
        </li>
        <li className="rounded border bg-white p-4">
          <p className="font-medium">3. Register your app</p>
          <p className="text-sm text-gray-600">
            Declare your app category (games, social, utilities…). Campaign bids match against it,
            so declare honestly — category-integrity checks flag mismatches.
          </p>
        </li>
        <li className="rounded border bg-white p-4">
          <p className="font-medium">4. Save your credentials</p>
          <p className="text-sm text-gray-600">
            You get a public <code>APP_ID</code> plus server-side secrets. Secrets stay on your
            server; only the APP_ID ships in the client.
          </p>
        </li>
        <li className="rounded border bg-white p-4">
          <p className="font-medium">5. Create placements and integrate</p>
          <p className="text-sm text-gray-600">
            One placement per format slot, then follow the{" "}
            <Link href="/docs/web-sdk" className="underline">
              web SDK guide
            </Link>{" "}
            using <code>mode: &quot;test&quot;</code> first.
          </p>
        </li>
      </ol>
    </div>
  );
}
