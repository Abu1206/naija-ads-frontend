// How the mock login maps an email to a role, shared by the login form (which
// posts credentials) and the dev role switcher (which names the role directly).
//
// The real backend decides the role; this only has to pick a sensible one so
// the redirect lands on a dashboard you can style.

import type { Role } from "@/lib/types";

const ROLES: Role[] = ["business", "developer", "admin"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/**
 * `admin@…` is an admin, `dev@…` or anything containing "developer" is a
 * developer, everything else is a business. Send whatever address you like —
 * the point is only to reach the dashboard you are styling.
 */
export function roleFromLoginEmail(email: string): Role {
  const value = email.trim().toLowerCase();
  if (!value) return "business";
  if (value.startsWith("admin@")) return "admin";
  if (value.startsWith("dev@") || value.includes("developer")) return "developer";
  return "business";
}
