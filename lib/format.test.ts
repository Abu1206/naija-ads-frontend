import { describe, expect, it } from "vitest";
import {
  formatCTR,
  formatCount,
  formatDate,
  formatECPM,
  formatFillRate,
  formatKobo,
  nairaInputToKobo,
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

describe("nairaInputToKobo", () => {
  it("converts a typed naira amount to kobo", () => {
    expect(nairaInputToKobo(1000)).toBe(100000);
  });

  it("rounds to whole kobo instead of sending a float", () => {
    expect(nairaInputToKobo(10.005)).toBe(1001);
  });
});
