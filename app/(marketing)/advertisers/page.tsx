import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertise in Nigerian apps and games — Naija Ads",
  description:
    "Run banner, interstitial, rewarded, and audio campaigns in Nigerian apps. Per-category CPM bids, admin-reviewed creatives, funding via Bachs.",
};

const STEPS = [
  { title: "Create your business profile", body: "Sign in with Google, add your business details, and pass a one-time manual verification." },
  { title: "Launch a campaign", body: "Set per-category CPM bids plus total and daily budgets. Bids clear a transparent floor per format." },
  { title: "Upload creatives", body: "Banners, interstitials, rewarded video, and audio. Every creative is reviewed before it can serve." },
  { title: "Fund and go live", body: "Top up through Bachs. Credits land only after webhook confirmation, then the auction starts serving." },
] as const;

const FORMATS = ["Banner", "Interstitial", "Rewarded video", "Audio"] as const;

export default function AdvertisersPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Put your brand inside Nigeria&apos;s favourite apps</h1>
        <p className="max-w-2xl text-gray-600">
          Naija Ads is a two-sided ad network: you buy inventory in real Nigerian games and apps,
          and pay CPM per category you target — never for clicks you didn&apos;t agree to.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup?role=business"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Start advertising
          </Link>
          <Link
            href="/pricing"
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Four formats, one auction</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <li key={f} className="rounded border bg-white p-4">
              <p className="font-medium">{f}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600">
          Richer formats carry higher floors. GIFs serve as a banner subtype on adaptive placements.
        </p>
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
        <Link href="/tutorials/first-campaign" className="text-sm underline">
          Follow the first-campaign tutorial →
        </Link>
      </section>
    </div>
  );
}
