import { describe, expect, it, vi } from "vitest";
import { apiFetch, apiUrl } from "./api";
import { ApiError } from "./types";

describe("apiUrl", () => {
  it("joins base and path", () => {
    expect(apiUrl("/api/v1/apps")).toBe("http://localhost:8080/api/v1/apps");
  });
});

describe("apiFetch", () => {
  it("maps 401 to a login error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(apiFetch("/api/v1/apps")).rejects.toMatchObject({ status: 401 });
    vi.unstubAllGlobals();
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
    vi.unstubAllGlobals();
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
    vi.unstubAllGlobals();
  });
});
