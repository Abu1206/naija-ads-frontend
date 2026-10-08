import { describe, expect, it } from "vitest";
import { roleFromCookie, SESSION_COOKIE } from "./role";

describe("roleFromCookie", () => {
  it("accepts the three known roles", () => {
    expect(roleFromCookie("business")).toBe("business");
    expect(roleFromCookie("developer")).toBe("developer");
    expect(roleFromCookie("admin")).toBe("admin");
  });

  it("rejects missing and unknown values", () => {
    expect(roleFromCookie(undefined)).toBeNull();
    expect(roleFromCookie("")).toBeNull();
    expect(roleFromCookie("superuser")).toBeNull();
    expect(roleFromCookie("ADMIN")).toBeNull();
  });

  it("names the session cookie", () => {
    expect(SESSION_COOKIE).toBe("naija_ads_session");
  });
});
