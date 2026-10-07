import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — Naija Ads",
  description: "Marketplace terms: review, floors, budgets, funding, earnings, payouts, and enforcement.",
};

const SECTIONS = [
  {
    title: "The marketplace",
    body: "Naija Ads is a two-sided network, not an agency. Businesses buy inventory; developers sell it. The backend decides auction winners, prices, and rewards — dashboards display, never dictate.",
  },
  {
    title: "Review before serving",
    body: "Businesses, developers, apps, campaigns, and creatives all pass manual verification. Prohibited content is rejected with a reason; the enforcement ladder runs warning → pause → revoke, with payouts held where fraud is suspected.",
  },
  {
    title: "Bids, floors, budgets",
    body: "CPM only. One bid per targeted category; every bid must clear the higher of the category and format floors. Total and daily budgets cap spend, with pacing across the day. Delivery is estimated, never guaranteed.",
  },
  {
    title: "Funding and payouts",
    body: "Advertiser funds credit only after Bachs webhook confirmation. Developer earnings validate before becoming available, and payout requests are approved manually. Only a human reverses a ledger entry.",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Terms</h1>
      {SECTIONS.map((s) => (
        <section key={s.title} className="space-y-2">
          <h2 className="text-xl font-bold">{s.title}</h2>
          <p className="text-sm text-gray-600">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
