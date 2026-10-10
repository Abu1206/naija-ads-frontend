import { describe, expect, it } from "vitest";
import { parseStatusFilter } from "@/lib/campaignStatus";

describe("parseStatusFilter", () => {
  it("accepts all and every ladder status", () => {
    expect(parseStatusFilter("all")).toBe("all");
    expect(parseStatusFilter("active")).toBe("active");
    expect(parseStatusFilter("under_review")).toBe("under_review");
  });

  it("falls back to the full table for missing or unknown params", () => {
    expect(parseStatusFilter(undefined)).toBe("all");
    expect(parseStatusFilter("archived")).toBe("all");
    expect(parseStatusFilter(["active", "paused"])).toBe("all");
  });
});
