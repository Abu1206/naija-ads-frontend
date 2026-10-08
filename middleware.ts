import { NextResponse, type NextRequest } from "next/server";
import { roleFromCookie, SESSION_COOKIE } from "@/lib/role";
import type { Role } from "@/lib/types";

const GUARDED: Array<{ prefix: string; role: Role }> = [
  { prefix: "/business", role: "business" },
  { prefix: "/developer", role: "developer" },
  { prefix: "/admin", role: "admin" },
];

// "/developers" is a public marketing page, so match on segment boundaries.
function requiredRole(pathname: string): Role | null {
  for (const { prefix, role } of GUARDED) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

export default function middleware(request: NextRequest) {
  const required = requiredRole(request.nextUrl.pathname);
  if (!required) return NextResponse.next();

  const current = roleFromCookie(request.cookies.get(SESSION_COOKIE)?.value);
  if (!current) return NextResponse.redirect(new URL("/login", request.url));
  if (current !== required) return NextResponse.redirect(new URL("/403", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/business/:path*", "/developer/:path*", "/admin/:path*", "/business", "/developer", "/admin"],
};
