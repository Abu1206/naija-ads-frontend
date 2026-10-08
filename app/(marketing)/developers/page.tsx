import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Monetize your app or game — Naija Ads for developers",
  description:
    "Register your app, create placements, integrate the web SDK, and earn per-category revenue shares with manual-review payouts.",
};

const STEPS = [
  { title: "Register your app", body: "Declare your app category (games, social, utilities…). Bids match against it, and scarce inventory earns more." },
  { title: "Create placements", body: "One placement per format slot: banner, interstitial, rewarded, audio. Each gets a unique placement ID." },
  { title: "Integrate the SDK", body: "Web SDK first. Test mode lets you verify rendering with zero money movement." },
  { title: "Get paid", body: "Earnings split per served category. Request payouts once validated — approved manually for MVP." },
] as const;

export default function DevelopersMarketingPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Earn from your app, your way</h1>
        <p className="max-w-2xl text-gray-600">
          Monetize Nigerian traffic with inventory you control. Declare your category, place the
          formats you want, and track every impression, fill rate, and kobo from your dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup?role=developer"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Start earning
          </Link>
          <Link
            href="/docs/getting-started"
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Read the docs
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded border bg-white p-4">
              <p className="font-medium">
                {i + 1}. {s.title}
              </p>
              <p className="text-sm text-gray-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <Link href="/tutorials/first-placement" className="text-sm underline">
          Follow the first-placement tutorial →
        </Link>
      </section>

      <section className="space-y-2 rounded border bg-white p-4">
        <h2 className="text-xl font-bold">Built for trust</h2>
        <p className="text-sm text-gray-600">
          Rewards are validated server-side, clicks require a served impression, and fraud controls
          run on every event. Test traffic never touches money.
        </p>
      </section>
    </div>
  );
}
