import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tutorials — Naija Ads",
  description: "Step-by-step walkthroughs: launch your first campaign, monetize your first app placement.",
};

const ITEMS = [
  {
    href: "/tutorials/first-campaign",
    title: "Launch your first campaign",
    body: "For advertisers: profile → campaign → creative → fund → live. About 20 minutes.",
  },
  {
    href: "/tutorials/first-placement",
    title: "Monetize your first placement",
    body: "For developers: app → placement → SDK → test mode → first live impression.",
  },
] as const;

export default function TutorialsIndexPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Tutorials</h1>
      <p className="max-w-2xl text-muted">
        Short, ordered walkthroughs with the exact pages to visit. No prior ad-tech knowledge needed.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-card border border-mist bg-white p-4 hover:bg-cloud">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-muted">{t.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
