import { describe, expect, it } from "vitest";
import {
  budgetUtilization,
  formatBytes,
  formatCTR,
  formatCount,
  formatDate,
  formatDelta,
  formatECPM,
  formatFillRate,
  formatKobo,
  formatShare,
  formatUtilization,
  nairaInputToKobo,
  percentChange,
} from "./format";

describe("formatKobo", () => {
  it("formats kobo ints as naira", () => {
    expect(formatKobo(100000)).toBe("₦1,000.00");
  });

  it("formats zero", () => {
    expect(formatKobo(0)).toBe("₦0.00");
  });
});

describe("formatCTR", () => {
  it("formats click-through rate", () => {
    expect(formatCTR(25, 1000)).toBe("2.50%");
  });

  it("returns em-dash on zero impressions", () => {
    expect(formatCTR(0, 0)).toBe("—");
  });
});

describe("formatECPM", () => {
  it("returns em-dash on zero impressions", () => {
    expect(formatECPM(50000, 0)).toBe("—");
  });

  it("formats revenue per mille", () => {
    // 50,000 kobo (=₦500) over 1,000 impressions -> ₦500 eCPM
    expect(formatECPM(50000, 1000)).toBe("₦500.00");
  });
});

describe("formatFillRate", () => {
  it("formats fill rate", () => {
    expect(formatFillRate(950, 1000)).toBe("95.00%");
  });

  it("returns em-dash on zero requests", () => {
    expect(formatFillRate(0, 0)).toBe("—");
  });
});

describe("formatDate", () => {
  it("returns em-dash for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(1284)).toBe("1,284");
  });

  it("formats zero as a real number, not a gap", () => {
    expect(formatCount(0)).toBe("0");
  });
});

describe("formatBytes", () => {
  it("formats bytes, kilobytes and megabytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(48210)).toBe("47.1 KB");
    expect(formatBytes(8421000)).toBe("8.0 MB");
  });

  it("returns em-dash for bad input", () => {
    expect(formatBytes(-1)).toBe("—");
  });
});

describe("nairaInputToKobo", () => {
  it("converts a typed naira amount to kobo", () => {
    expect(nairaInputToKobo(1000)).toBe(100000);
  });

  it("rounds to whole kobo instead of sending a float", () => {
    expect(nairaInputToKobo(10.005)).toBe(1001);
  });
});

describe("percentChange", () => {
  it("computes relative change", () => {
    expect(percentChange(110, 100)).toBeCloseTo(0.1);
    expect(percentChange(90, 100)).toBeCloseTo(-0.1);
  });

  it("returns null with no baseline instead of inventing a lift", () => {
    expect(percentChange(100, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
  });
});

describe("formatDelta", () => {
  it("formats an uplift with one decimal", () => {
    expect(formatDelta(1842000, 1680000)).toEqual({ text: "↑ 9.6%", direction: "up" });
  });

  it("formats a decline", () => {
    expect(formatDelta(43200, 46100)?.direction).toBe("down");
  });

  it("returns null with no baseline", () => {
    expect(formatDelta(100, 0)).toBeNull();
  });
});

describe("budgetUtilization", () => {
  it("returns the spend share of the total budget", () => {
    expect(budgetUtilization(87320000, 1106500000)).toBeCloseTo(0.0732, 3);
  });

  it("returns null when there is no budget", () => {
    expect(budgetUtilization(0, 0)).toBeNull();
  });

  it("formats as a used percentage", () => {
    expect(formatUtilization(87320000, 1106500000)).toBe("7.3% used");
    expect(formatUtilization(0, 0)).toBe("—");
  });

  it("formats a bare share for inline use", () => {
    expect(formatShare(0.07316)).toBe("7.3%");
    expect(formatShare(null)).toBe("—");
  });
});
