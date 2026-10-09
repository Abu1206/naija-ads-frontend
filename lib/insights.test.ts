import { describe, expect, it } from "vitest";
import { attentionFlags, detectGrain, seriesDeltas } from "./insights";
import type { Campaign } from "./types";

const campaign = (overrides: Partial<Campaign>): Campaign => ({
  id: "cmp_test",
  business_id: "biz_acme_foods",
  name: "Test campaign",
  objective: "impressions",
  status: "active",
  ad_type: "banner",
  total_budget_kobo: 100000000,
  daily_budget_kobo: 1000000,
  spend_kobo: 10000000,
  remaining_budget_kobo: 90000000,
  impressions: 100000,
  clicks: 2500,
  destination_url: "https://acme.ng",
  created_at: "2026-09-01T09:00:00.000Z",
  ...overrides,
});

describe("detectGrain", () => {
  it("detects daily periods", () => {
    expect(detectGrain(["2026-10-01", "2026-10-02"])).toBe("daily");
  });

  it("defaults to monthly", () => {
    expect(detectGrain(["2026-09", "2026-10"])).toBe("monthly");
    expect(detectGrain([])).toBe("monthly");
  });
});

describe("seriesDeltas", () => {
  const series = [
    { period: "2026-09", impressions: 1680000, clicks: 43200 },
    { period: "2026-10", impressions: 1842000, clicks: 46100 },
  ];

  it("compares the last two points with the previous label", () => {
    const deltas = seriesDeltas(series, (p) => p.slice(5));
    expect(deltas.prevLabel).toBe("09");
    expect(deltas.impressions).toEqual({ text: "↑ 9.6%", direction: "up" });
    expect(deltas.clicks?.direction).toBe("up");
    // CTR slipped from 2.57% to 2.50%: impressions grew faster than clicks.
    expect(deltas.ctr?.direction).toBe("down");
  });

  it("returns nulls for a single point", () => {
    const deltas = seriesDeltas(series.slice(0, 1), (p) => p);
    expect(deltas).toEqual({ impressions: null, clicks: null, ctr: null, prevLabel: null });
  });
});

describe("attentionFlags", () => {
  it("ranks rejected above paused above healthy", () => {
    const flags = attentionFlags([
      campaign({ id: "a", name: "Healthy", status: "active" }),
      campaign({ id: "b", name: "Paused one", status: "paused" }),
      campaign({ id: "c", name: "Rejected one", status: "rejected" }),
    ]);
    expect(flags.map((f) => f.campaign.id)).toEqual(["c", "b"]);
  });

  it("flags weak CTR and nearly-spent budgets on active campaigns", () => {
    const flags = attentionFlags([
      campaign({ id: "low", impressions: 50000, clicks: 100, spend_kobo: 1000, remaining_budget_kobo: 999000 }),
      campaign({ id: "rich", impressions: 50000, clicks: 2000, spend_kobo: 90000000, remaining_budget_kobo: 10000000 }),
    ]);
    expect(flags.map((f) => f.campaign.id)).toEqual(["low", "rich"]);
    expect(flags[0]!.reason).toMatch(/CTR under 1%/);
    expect(flags[1]!.reason).toMatch(/85%\+ used/);
  });

  it("caps at four flags", () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      campaign({ id: `d${i}`, name: `Draft ${i}`, status: "draft" }),
    );
    expect(attentionFlags(many)).toHaveLength(4);
  });
});
