import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer docs — Naija Ads",
  description: "Integrate Naija Ads: register apps, create placements, and serve banner, interstitial, rewarded, and audio ads.",
};

const CARDS = [
  { href: "/docs/getting-started", title: "Getting started", body: "Accounts, verification, and your first APP_ID in five steps." },
  { href: "/docs/web-sdk", title: "Web SDK", body: "Request ads, report events, and validate rewards." },
  { href: "/docs/formats", title: "Formats & placements", body: "Banner sizes, adaptive slots, interstitial, rewarded, audio." },
  { href: "/docs/test-mode", title: "Test mode", body: "Verify rendering with mode test — zero money movement." },
] as const;

export default function DocsIndexPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Developer docs</h1>
      <p className="max-w-2xl text-muted">
        Everything a publisher needs: register an app, create placements, integrate the SDK, and
        get paid. Field names match the backend API exactly.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-card border border-mist bg-white p-4 hover:bg-cloud">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted">{c.body}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted">
        Prefer learning by doing? Try the{" "}
        <Link href="/tutorials/first-placement" className="underline">
          first-placement tutorial
        </Link>
        .
      </p>
    </div>
  );
}
