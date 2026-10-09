import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, apiUrl, load } from "./api";
import { ApiError } from "./types";

// These cover the *live* transport against the Go API. Mock mode swaps the
// transport out, so it is pinned off here to keep the assertions about fetch,
// credentials and error mapping meaningful. lib/mock/store.test.ts covers the
// fixture path.
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "live");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("apiUrl", () => {
  it("joins base and path", () => {
    expect(apiUrl("/api/v1/apps")).toBe("http://localhost:8080/api/v1/apps");
  });
});

describe("apiFetch", () => {
  it("maps 401 to a login error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(apiFetch("/api/v1/apps")).rejects.toMatchObject({ status: 401 });
  });

  it("maps 422 to field errors", async () => {
    const fields = { name: ["is required"] };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ fields }), { status: 422, headers: { "Content-Type": "application/json" } }),
        ),
    );
    const err = await apiFetch("/api/v1/apps").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).fields).toEqual(fields);
  });

  it("maps an unreachable API to a readable error, not the browser's wording", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const err = await apiFetch("/api/v1/auth/login").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
    expect((err as ApiError).message).toContain("NEXT_PUBLIC_API_BASE_URL");
  });

  it("sends cookies for httpOnly session auth", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await apiFetch("/api/v1/apps");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" }),
    );
  });
});

describe("load", () => {
  it("returns data and no error on a good response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: "c1" }]), { status: 200 })),
    );
    await expect(load("/api/v1/campaigns")).resolves.toEqual({
      data: [{ id: "c1" }],
      error: null,
    });
  });

  it("never throws: an API failure becomes an error string", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));
    const result = await load("/api/v1/campaigns");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Forbidden");
  });

  it("names the env var when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const result = await load("/api/v1/campaigns");
    expect(result.data).toBeNull();
    expect(result.error).toContain("NEXT_PUBLIC_API_BASE_URL");
  });
});
