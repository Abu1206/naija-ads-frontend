import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Launch your first campaign — Naija Ads tutorials",
  description: "Advertiser walkthrough: business profile, campaign with per-category bids, creative upload, Bachs funding, go live.",
};

const STEPS = [
  { title: "Sign up and verify", body: "Go to /signup as a business, complete name, country, phone, representative, and vertical, then submit. Serving waits on manual approval." },
  { title: "Create a campaign", body: "At /business/campaigns/new set a name, objective, total + daily budget, format, and one CPM bid per category you target. Bids below the effective floor are rejected at review." },
  { title: "Upload a creative", body: "At /business/creatives add your banner, video, or audio file plus its destination URL. Types, dimensions, and size caps are validated server-side." },
  { title: "Wait for approval", body: "Campaigns and creatives move DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED. Watch the status badge on /business/campaigns." },
  { title: "Fund via Bachs", body: "At /business/billing open a Bachs checkout. Your balance updates only after the webhook confirms — never trust the redirect alone." },
  { title: "Go live and read spend", body: "Approved + funded campaigns enter the auction automatically. Spend, impressions, clicks, and CTR appear on your campaign list." },
] as const;

export default function FirstCampaignTutorialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Launch your first campaign</h1>
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
      <p className="text-sm text-gray-600">
        New to the model? Start with <Link href="/advertisers" className="underline">how advertising works</Link> or{" "}
        <Link href="/pricing" className="underline">pricing</Link>.
      </p>
    </div>
  );
}
