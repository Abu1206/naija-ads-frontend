import type { MetadataRoute } from "next";

const SITE = "https://naija-ads.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/advertisers",
    "/developers",
    "/pricing",
    "/docs",
    "/docs/getting-started",
    "/docs/web-sdk",
    "/docs/formats",
    "/docs/test-mode",
    "/tutorials",
    "/tutorials/first-campaign",
    "/tutorials/first-placement",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
  ];
  return pages.map((p) => ({ url: `${SITE}${p || "/"}`, lastModified: new Date() }));
}
