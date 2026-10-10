import { describe, expect, it } from "vitest";
import {
  DEFAULT_METRIC,
  DEFAULT_RANGE,
  grainForRange,
  parseChartMetric,
  parseChartRange,
  RANGE_COMPARISON,
} from "./ranges";

describe("parseChartRange", () => {
  it("accepts the five presets", () => {
    expect(parseChartRange("7d")).toBe("7d");
    expect(parseChartRange("30d")).toBe("30d");
    expect(parseChartRange("90d")).toBe("90d");
    expect(parseChartRange("6m")).toBe("6m");
    expect(parseChartRange("all")).toBe("all");
  });

  it("falls back to 30D for missing, unknown or repeated params", () => {
    expect(parseChartRange(undefined)).toBe(DEFAULT_RANGE);
    expect(parseChartRange("last-quarter")).toBe(DEFAULT_RANGE);
    expect(parseChartRange(["30d", "7d"])).toBe(DEFAULT_RANGE);
  });

  it("maps ranges to the grain the backend serves", () => {
    expect(grainForRange("7d")).toBe("daily");
    expect(grainForRange("30d")).toBe("daily");
    expect(grainForRange("90d")).toBe("weekly");
    expect(grainForRange("6m")).toBe("monthly");
    expect(grainForRange("all")).toBe("monthly");
  });
});

describe("parseChartMetric", () => {
  it("accepts the four metrics with Combo default", () => {
    expect(DEFAULT_METRIC).toBe("combo");
    expect(parseChartMetric("ctr")).toBe("ctr");
    expect(parseChartMetric(undefined)).toBe("combo");
    expect(parseChartMetric("everything")).toBe("combo");
  });
});

describe("RANGE_COMPARISON", () => {
  it("names the equal-length window before each range", () => {
    // The caption must describe the real baseline — never "vs 7 Oct".
    expect(RANGE_COMPARISON["7d"]).toBe("vs previous 7 days");
    expect(RANGE_COMPARISON["30d"]).toBe("vs previous 30 days");
    expect(RANGE_COMPARISON["90d"]).toBe("vs previous 90 days");
    expect(RANGE_COMPARISON["6m"]).toBe("vs previous 6 months");
    // All time has no equal-length baseline: no caption, null deltas.
    expect(RANGE_COMPARISON["all"]).toBeUndefined();
  });
});
