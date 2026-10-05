import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./types";

const SESSION_COOKIE = "naija_ads_session";

/** Server-side role read from the httpOnly session cookie. */
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw === "business" || raw === "developer" || raw === "admin") return raw;
  return null;
}

/** Route guard for dashboard layouts: unauth -> /login, wrong role -> 403 page. */
export async function requireRole(role: Role): Promise<void> {
  const current = await getRole();
  if (!current) redirect("/login");
  if (current !== role) redirect("/403");
}
