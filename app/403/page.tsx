import Link from "next/link";
import { DevSession } from "@/components/DevSession";

/** Matches lib/auth.ts: wrong-role dashboard visits redirect to /403. */
export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">403 — Wrong dashboard</h1>
        <p className="text-sm text-gray-600">
          Your account doesn&apos;t have access to that section. Business, developer, and admin areas
          are separate.
        </p>
        <Link href="/" className="inline-block underline">
          Back to home
        </Link>
      </div>
      {/* Escape hatch while styling: the only way to a different dashboard
          without a working backend to swap the session cookie. */}
      <DevSession />
    </div>
  );
}
