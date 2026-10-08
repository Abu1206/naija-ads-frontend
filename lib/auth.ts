import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleFromCookie, SESSION_COOKIE } from "./role";
import type { Role } from "./types";

/** Server-side role read from the httpOnly session cookie. */
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return roleFromCookie(store.get(SESSION_COOKIE)?.value);
}

/** Route guard for dashboard layouts: unauth -> /login, wrong role -> 403 page. */
export async function requireRole(role: Role): Promise<void> {
  const current = await getRole();
  if (!current) redirect("/login");
  if (current !== role) redirect("/403");
}
