// Kept free of `next/headers` and `next/navigation` so `middleware.ts` (edge
// runtime) can share the same role parsing as the server-component guards.

import type { Role } from "./types";

export const SESSION_COOKIE = "naija_ads_session";

export function roleFromCookie(raw: string | undefined | null): Role | null {
  if (raw === "business" || raw === "developer" || raw === "admin") return raw;
  return null;
}
