import { describe, expect, it } from "vitest";
import { attentionFlags, windowDeltas, windowTotals } from "./insights";
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

describe("windowTotals", () => {
  it("sums impressions and clicks across the window", () => {
    const totals = windowTotals([
      { period: "2026-10-01", impressions: 1200, clicks: 40 },
      { period: "2026-10-02", impressions: 800, clicks: 20 },
    ]);
    expect(totals).toEqual({ impressions: 2000, clicks: 60 });
  });

  it("returns zeroes for an empty window", () => {
    expect(windowTotals([])).toEqual({ impressions: 0, clicks: 0 });
  });
});

describe("windowDeltas", () => {
  // 30D window: 1,842,000 impressions, 46,100 clicks (CTR 2.50%).
  const series = [
    { period: "2026-10-01", impressions: 900000, clicks: 22500 },
    { period: "2026-10-02", impressions: 942000, clicks: 23600 },
  ];

  it("compares the window against the previous window", () => {
    const deltas = windowDeltas(series, { impressions: 1680000, clicks: 43200 });
    expect(deltas.impressions).toEqual({ text: "↑ 9.6%", direction: "up" });
    expect(deltas.clicks?.direction).toBe("up");
    // CTR slipped from 2.57% to 2.50%: impressions grew faster than clicks.
    expect(deltas.ctr?.direction).toBe("down");
  });

  it("returns nulls with no baseline, so callers drop the delta", () => {
    expect(windowDeltas(series, null)).toEqual({ impressions: null, clicks: null, ctr: null });
  });

  it("returns nulls for an empty window", () => {
    expect(windowDeltas([], { impressions: 1680000, clicks: 43200 })).toEqual({
      impressions: null,
      clicks: null,
      ctr: null,
    });
  });

  it("returns nulls when the baseline shows no impressions", () => {
    expect(windowDeltas(series, { impressions: 0, clicks: 0 })).toEqual({
      impressions: null,
      clicks: null,
      ctr: null,
    });
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
