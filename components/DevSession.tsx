"use client";

import { useTransition } from "react";
import { devSignIn, devSignOut } from "@/lib/mock/actions";
import { isMock } from "@/lib/mock";
import type { Role } from "@/lib/types";

const ROLES: Array<{ role: Role; label: string }> = [
  { role: "business", label: "Business" },
  { role: "developer", label: "Developer" },
  { role: "admin", label: "Admin" },
];

/**
 * Dev-only role switcher.
 *
 * Mock mode has no backend to issue the httpOnly session cookie that the guards
 * read, so this signs you in by setting that same cookie — the guard path,
 * cookie name and cookie format are all unchanged. It renders only when
 * `NEXT_PUBLIC_DATA_SOURCE` is not "live", and it is the first thing to delete
 * when real auth lands. Dashed border and a "Dev only" label keep it from ever
 * reading as product surface.
 */
export function DevSession() {
  const [pending, startTransition] = useTransition();

  if (!isMock()) return null;

  return (
    <section
      role="note"
      aria-label="Developer session"
      className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
        Dev only — no backend connected
      </p>
      <p className="mt-1 text-sm text-amber-800">
        Pick a role to sign in against fixtures. This panel disappears once the real API is
        connected.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ROLES.map(({ role, label }) => (
          <button
            key={role}
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => { await devSignIn(role); })}
            className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
          >
            {pending ? "Signing in…" : `Sign in as ${label}`}
          </button>
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => { await devSignOut(); })}
          className="rounded-lg px-3 py-1.5 text-sm text-amber-700 underline hover:text-amber-900 disabled:opacity-60"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
