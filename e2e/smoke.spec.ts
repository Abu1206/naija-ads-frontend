import { test, expect } from "@playwright/test";

// Critical flow smoke: landing -> login -> role dashboards render their
// empty states (Phase 1 shells, no backend yet).
test("landing links to login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
});

test("login form renders with labels", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
