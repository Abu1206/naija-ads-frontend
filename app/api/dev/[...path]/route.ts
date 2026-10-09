import { NextResponse, type NextRequest } from "next/server";
import { isMock } from "@/lib/mock";
import { mockWrite } from "@/lib/mock/store";
import { isRole, roleFromLoginEmail } from "@/lib/mock/session";
import { SESSION_COOKIE } from "@/lib/role";

/**
 * Generic mock write endpoint.
 *
 * `apiFetch` runs in the browser (client components), so it cannot reach the
 * server's in-memory store directly. In mock mode it posts here instead: the
 * transport is swapped, the path is not, and `lib/endpoints.ts` keeps describing
 * the real API surface.
 *
 * Login is special-cased because the real backend sets the httpOnly session
 * cookie on that response — with no server to do it, this route does, using the
 * same helper `/api/dev/session` uses.
 *
 * 404s entirely when `NEXT_PUBLIC_DATA_SOURCE=live`.
 */

function setSessionCookie(request: NextRequest, role: string): string {
  const secure = request.nextUrl.protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${role}; Path=/; SameSite=Lax; HttpOnly; Max-Age=28800${secure}`;
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!isMock()) return new NextResponse(null, { status: 404 });

  const { path } = await context.params;
  const apiPath = `/${path.join("/")}`;

  // The presigned-R2 PUT. The bytes are discarded here; the point is that the
  // upload flow completes and the confirmation call runs, exactly as it will
  // against real storage.
  if (request.method === "PUT") return new NextResponse(null, { status: 200 });

  let body: unknown = null;
  if (request.method !== "GET" && request.method !== "DELETE") {
    try {
      body = await request.json();
    } catch {
      body = null;
    }
  }

  if (apiPath === "/api/v1/auth/login") {
    const data = (body ?? {}) as Record<string, unknown>;
    const role = isRole(data.role) ? data.role : roleFromLoginEmail(String(data.email ?? ""));
    return NextResponse.json(
      { role },
      { headers: { "Set-Cookie": setSessionCookie(request, role) } },
    );
  }

  const result = mockWrite(apiPath, body);
  return NextResponse.json(result.body, { status: result.status });
}

export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
