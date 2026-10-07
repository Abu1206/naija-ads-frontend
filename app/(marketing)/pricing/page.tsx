import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Naija Ads",
  description:
    "CPM-only pricing with per-category bids and transparent format floors. No hidden fees; delivery is estimated, never guaranteed.",
};

const ROWS = [
  { format: "Banner", note: "Static display + GIF subtype on adaptive placements.", floor: "Lowest floor" },
  { format: "Interstitial", note: "Full-screen static or short video.", floor: "Mid floor" },
  { format: "Rewarded video", note: "Opt-in video; rewards validated server-side.", floor: "High floor" },
  { format: "Audio", note: "Audio with a companion banner.", floor: "Highest floor" },
] as const;

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">CPM-only pricing, no surprises</h1>
        <p className="max-w-2xl text-gray-600">
          You set one CPM bid per category you target. Every bid must clear the effective floor —
          the higher of the category floor and the format floor — or it is rejected at review, never
          silently clamped. Exact floor values are shown in the dashboard when you create a campaign.
        </p>
      </section>

      <section className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Format
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                What it is
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Floor tier
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ROWS.map((r) => (
              <tr key={r.format}>
                <td className="px-4 py-3 text-sm font-medium">{r.format}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.note}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.floor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2 text-sm text-gray-600">
        <p>Budgets are capped twice: a total budget and a daily budget with pacing across the day.</p>
        <p>Delivery is estimated, never guaranteed — the auction rotates winners weighted by bid.</p>
        <Link href="/signup?role=business" className="inline-block underline">
          Start advertising →
        </Link>
      </section>
    </div>
  );
}
