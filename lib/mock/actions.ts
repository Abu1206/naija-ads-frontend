"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isMock } from "./index";
import { isRole } from "./session";
import { SESSION_COOKIE } from "@/lib/role";
import type { Role } from "@/lib/types";

/**
 * Dev-only session issuer.
 *
 * Mock mode has no Go server to hand out the httpOnly session cookie that
 * `middleware.ts` and `lib/auth.ts` read, so these actions set that exact cookie
 * with the exact same attributes. Guard logic, cookie name and cookie format
 * stay identical to production — only the source of truth for the role is
 * faked.
 *
 * Implemented as server actions rather than a route handler + client fetch
 * because `redirect()` runs before any navigation: the guard on the destination
 * route always sees the new cookie, and no client-side cache can serve a stale
 * dashboard for the role you just picked.
 *
 * Both actions refuse to do anything when `NEXT_PUBLIC_DATA_SOURCE=live`, so a
 * live build cannot mint a session.
 */

const ROLE_HOME: Record<Role, string> = {
  business: "/business",
  developer: "/developer",
  admin: "/admin",
};

export async function devSignIn(role: unknown): Promise<void> {
  if (!isMock()) redirect("/login");
  if (!isRole(role)) redirect("/login");

  const store = await cookies();
  // Same attributes the Go server sends: httpOnly, no localStorage, readable
  // only by the server-side guards.
  store.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });

  redirect(ROLE_HOME[role]);
}

export async function devSignOut(): Promise<void> {
  if (!isMock()) redirect("/login");
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
