import { beforeEach, describe, expect, it } from "vitest";
import { mockRead, mockWrite, resetStore } from "./store";
import { roleFromLoginEmail, isRole } from "./session";

// Every path these tests use is one a real page calls through `load()` or
// `apiFetch()`, so a rename in lib/endpoints.ts that breaks the mock layer also
// breaks a screen — which is the point of keying fixtures to path rather than to
// a name the pages share.

beforeEach(() => {
  resetStore();
});

describe("mockRead", () => {
  it("serves analytics for both scopes", () => {
    const demand = mockRead<{ scope: string }>("/api/v1/analytics?scope=business");
    const supply = mockRead<{ scope: string }>("/api/v1/analytics?scope=developer");
    expect(demand).not.toBeNull();
    expect(supply).not.toBeNull();
  });

  it("windows the series by range at the grain the backend would serve", () => {
    const d7 = mockRead<{ series: { period: string; impressions: number; clicks: number }[] }>(
      "/api/v1/analytics?scope=business&range=7d",
    );
    expect(d7?.series).toHaveLength(7);
    // Full days only: the window ends on the last complete day, never today.
    expect(d7?.series[d7.series.length - 1]?.period).toBe("2026-10-08");
    expect(d7?.series.every((p) => p.clicks <= p.impressions)).toBe(true);

    const d30 = mockRead<{ series: { period: string }[] }>(
      "/api/v1/analytics?scope=business&range=30d",
    );
    expect(d30?.series).toHaveLength(30);

    const w90 = mockRead<{ series: { period: string }[] }>(
      "/api/v1/analytics?scope=developer&range=90d",
    );
    // Thirteen exact 7-day buckets, oldest first.
    expect(w90?.series).toHaveLength(13);
    const [first, second] = [w90!.series[0]!.period, w90!.series[1]!.period];
    const gapDays =
      (new Date(`${second}T00:00:00Z`).getTime() - new Date(`${first}T00:00:00Z`).getTime()) /
      86400000;
    expect(gapDays).toBe(7);

    const m6 = mockRead<{ series: { period: string }[] }>(
      "/api/v1/analytics?scope=business&range=6m",
    );
    expect(m6?.series).toHaveLength(6);
    expect(m6?.series[0]?.period).toBe("2026-05");

    // No range param keeps the legacy monthly series; totals stay all-time.
    const legacy = mockRead<{ series: unknown[]; impressions: number }>(
      "/api/v1/analytics?scope=business",
    );
    expect(legacy?.series).toHaveLength(6);
    expect(legacy?.impressions).toBe(5172900);
  });

  it("serves the equal-length previous window for honest deltas", () => {
    type Window = {
      series: { impressions: number }[];
      previous_window: { impressions: number; clicks: number } | null;
    };
    const read = (path: string) => mockRead<Window>(path);

    const d7 = read("/api/v1/analytics?scope=business&range=7d")!;
    const cur7 = d7.series.reduce((s, p) => s + p.impressions, 0);
    // A growing fixture: every window beats its predecessor.
    expect(d7.previous_window!.impressions).toBeGreaterThan(0);
    expect(d7.previous_window!.impressions).toBeLessThan(cur7);

    const m6 = read("/api/v1/analytics?scope=business&range=6m")!;
    expect(m6.previous_window!.impressions).toBeLessThan(5172900);
    // The prior window keeps the fixture's own CTR ballpark, not a round lie.
    const prevCtr = m6.previous_window!.clicks / m6.previous_window!.impressions;
    expect(prevCtr).toBeGreaterThan(0.02);
    expect(prevCtr).toBeLessThan(0.05);

    // No range = no comparison baseline (the admin overview reads this).
    const legacy = read("/api/v1/analytics?scope=business")!;
    expect(legacy.previous_window).toBeNull();
  });

  it("scopes owned collections to the signed-in account", () => {
    const campaigns = mockRead<{ business_id: string }[]>("/api/v1/campaigns");
    expect(campaigns?.length).toBeGreaterThan(0);
    expect(campaigns?.every((c) => c.business_id === "biz_acme_foods")).toBe(true);
  });

  it("scopes creatives through the caller's own campaigns", () => {
    const creatives = mockRead<{ campaign_id: string }[]>("/api/v1/creatives");
    const campaigns = mockRead<{ id: string }[]>("/api/v1/campaigns");
    const owned = new Set(campaigns?.map((c) => c.id));
    expect(creatives?.every((c) => owned.has(c.campaign_id))).toBe(true);
  });

  it("gives admin endpoints everything, not the caller's slice", () => {
    const all = mockRead<unknown[]>("/api/v1/admin/campaigns");
    const mine = mockRead<unknown[]>("/api/v1/campaigns");
    expect((all?.length ?? 0)).toBeGreaterThanOrEqual(mine?.length ?? 0);
  });

  it("returns null for an unmapped path rather than inventing data", () => {
    expect(mockRead("/api/v1/not-a-real-endpoint")).toBeNull();
  });
});

describe("mockWrite", () => {
  it("creates a campaign as a draft that has spent nothing", () => {
    const result = mockWrite("/api/v1/campaigns", {
      name: "Test Campaign",
      objective: "impressions",
      ad_type: "banner",
      total_budget_kobo: 15000000,
      daily_budget_kobo: 50000,
      destination_url: "https://acme.ng/test",
    });

    expect(result.status).toBe(201);
    const created = result.body as { status: string; spend_kobo: number; remaining_budget_kobo: number };
    expect(created.status).toBe("draft");
    expect(created.spend_kobo).toBe(0);
    // The remainder of a fresh campaign is the budget that was typed in, not a
    // derived balance — the same value the server would echo back.
    expect(created.remaining_budget_kobo).toBe(15000000);

    const stored = mockRead<{ name: string }[]>("/api/v1/campaigns");
    expect(stored?.some((c) => c.name === "Test Campaign")).toBe(true);
  });

  it("registers an app as pending, because approval is a manual admin step", () => {
    const result = mockWrite("/api/v1/apps", {
      name: "New App",
      platform: "android",
      category: "games",
      package_name: "ng.adaokonkwo.newapp",
    });
    expect(result.status).toBe(201);
    expect((result.body as { status: string }).status).toBe("pending");
  });

  it("points the creative upload at a dev target and reports a submitted creative", () => {
    const intent = mockWrite("/api/v1/creatives/upload-intent", { ad_type: "banner", file_name: "a.png" });
    expect(intent.status).toBe(200);
    const { creative_id, upload_url } = intent.body as { creative_id: string; upload_url: string };
    expect(creative_id).toBeTruthy();
    expect(upload_url).toBe("/api/dev/upload");

    const confirm = mockWrite("/api/v1/creatives", { creative_id });
    expect((confirm.body as { status: string }).status).toBe("submitted");
  });

  it("creates a payment as pending: a redirect is not a credit", () => {
    const result = mockWrite("/api/v1/payments", { amount_kobo: 5000000 });
    expect(result.status).toBe(201);
    expect((result.body as { status: string }).status).toBe("pending");
    expect((result.body as { checkout_url: string }).checkout_url).toContain("bachs");
  });

  it("applies a review decision to the right entity and writes an audit row", () => {
    const before = mockRead<unknown[]>("/api/v1/admin/audit-logs")?.length ?? 0;

    // App keys on app_id, not id — the lookup has to respect that.
    const result = mockWrite("/api/v1/admin/reviews/decision", { kind: "app", id: "app_ride_hail", decision: "reject" });
    expect(result.status).toBe(200);

    const apps = mockRead<{ app_id: string; status: string }[]>("/api/v1/admin/apps");
    expect(apps?.find((a) => a.app_id === "app_ride_hail")?.status).toBe("rejected");

    const after = mockRead<unknown[]>("/api/v1/admin/audit-logs")?.length ?? 0;
    expect(after).toBe(before + 1);
  });

  it("404s a review decision for an unknown target", () => {
    const result = mockWrite("/api/v1/admin/reviews/decision", { kind: "app", id: "nope", decision: "approve" });
    expect(result.status).toBe(404);
  });

  it("404s an unmapped path instead of silently succeeding", () => {
    expect(mockWrite("/api/v1/not-a-real-endpoint", {}).status).toBe(404);
  });

  it("resolves a role from a login email", () => {
    expect(mockWrite("/api/v1/auth/login", { email: "admin@naijaads.ng" }).body).toEqual({ role: "admin" });
    expect(mockWrite("/api/v1/auth/login", { email: "dev@naijaads.ng" }).body).toEqual({ role: "developer" });
    expect(mockWrite("/api/v1/auth/login", { email: "hello@acme.ng" }).body).toEqual({ role: "business" });
    // An explicit role wins, so the dev switcher is not bound to the email rule.
    expect(mockWrite("/api/v1/auth/login", { email: "hello@acme.ng", role: "admin" }).body).toEqual({ role: "admin" });
  });
});

describe("resetStore", () => {
  it("drops mutations back to the seed data", () => {
    mockWrite("/api/v1/campaigns", { name: "Throwaway", total_budget_kobo: 100 });
    expect(mockRead<{ name: string }[]>("/api/v1/campaigns")?.some((c) => c.name === "Throwaway")).toBe(true);

    resetStore();
    expect(mockRead<{ name: string }[]>("/api/v1/campaigns")?.some((c) => c.name === "Throwaway")).toBe(false);
  });
});

describe("roleFromLoginEmail", () => {
  it("maps known addresses to a dashboard", () => {
    expect(roleFromLoginEmail("admin@naijaads.ng")).toBe("admin");
    expect(roleFromLoginEmail("dev@naijaads.ng")).toBe("developer");
    expect(roleFromLoginEmail("ada@naijaads.ng")).toBe("business");
  });

  it("defaults to business for a blank address", () => {
    expect(roleFromLoginEmail("")).toBe("business");
    expect(roleFromLoginEmail("   ")).toBe("business");
  });

  it("only accepts the three real roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("superuser")).toBe(false);
    expect(isRole(null)).toBe(false);
  });
});
