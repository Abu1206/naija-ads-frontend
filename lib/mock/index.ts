// The one switch between the disconnected frontend and the real Go API.
//
// `NEXT_PUBLIC_DATA_SOURCE` is read at build time, so it is the same value in
// the server components that call `load()` and the client components that call
// `apiFetch()`. Anything other than "live" means mock: that is deliberate while
// the backend is undeployed, and it means a forgotten env var degrades to
// working fixtures instead of a wall of error states.
//
// Read inside the function rather than frozen at import so a test can drive
// either transport. Next inlines `NEXT_PUBLIC_*` at build time, so the read
// collapses to a string comparison in the client bundle either way.

import { ApiError } from "@/lib/types";
import { mockRead, mockWrite } from "./store";

// Pages and tests reach the store through this module so the import graph stays
// one level deep: `lib/api.ts` -> `lib/mock` -> `lib/mock/store`.
export { mockRead, mockWrite, resetStore } from "./store";
export * from "./data";

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

/** True when the app is running against fixtures rather than the Go API. */
export function isMock(): boolean {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") !== "live";
}

/**
 * Client-side stand-in for `apiFetch`. Writes are POSTed to our own
 * `/api/dev/*` route handler because the browser cannot reach the server's
 * in-memory store; reads never come here (a server component resolves them).
 */
export async function mockFetch<T>(path: string, options: RequestInit & { body?: unknown } = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const target = `/api/dev${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(target, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(headers as Record<string, string>) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the mock API. Is the dev server running?");
  }

  if (res.status === 401) throw new ApiError(401, "Unauthorized — please log in again.");
  if (res.status === 422) {
    const data: unknown = await res.json().catch(() => null);
    throw new ApiError(422, "Validation failed.");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text || `Request failed (${res.status}).`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
