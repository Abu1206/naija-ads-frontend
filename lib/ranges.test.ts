import { describe, expect, it } from "vitest";
import {
  DEFAULT_METRIC,
  DEFAULT_RANGE,
  grainForRange,
  parseChartMetric,
  parseChartRange,
} from "./ranges";

describe("parseChartRange", () => {
  it("accepts the four presets", () => {
    expect(parseChartRange("7d")).toBe("7d");
    expect(parseChartRange("30d")).toBe("30d");
    expect(parseChartRange("90d")).toBe("90d");
    expect(parseChartRange("6m")).toBe("6m");
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
