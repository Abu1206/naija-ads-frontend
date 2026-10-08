// Single typed backend client. Every fetch to the Go API goes through here:
// URL building, auth (httpOnly cookie credentials), and error mapping
// (401 -> login, 422 -> field errors). No component fetches ad-hoc.

import { ApiError, type FieldErrors } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, "")}${clean}`;
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function isFieldErrors(value: unknown): value is FieldErrors {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(
    (v) => Array.isArray(v) && v.every((s) => typeof s === "string"),
  );
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    // Session/JWT lives in an httpOnly cookie — never localStorage.
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new ApiError(401, "Unauthorized — please log in again.");
  }

  if (res.status === 422) {
    const data: unknown = await res.json().catch(() => null);
    const fields =
      typeof data === "object" &&
      data !== null &&
      "fields" in data &&
      isFieldErrors((data as { fields: unknown }).fields)
        ? (data as { fields: FieldErrors }).fields
        : undefined;
    throw new ApiError(422, "Validation failed.", fields);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text || `Request failed (${res.status}).`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { API_BASE };

/**
 * Server-component read that never throws: dashboards must render their error
 * state instead of a stack when the API is down or rejects the session.
 */
export async function load<T>(
  path: string,
  options: ApiOptions = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await apiFetch<T>(path, options), error: null };
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Could not reach the Naija Ads API. Check NEXT_PUBLIC_API_BASE_URL.";
    return { data: null, error: message };
  }
}
