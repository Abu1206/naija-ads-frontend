import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Naija Ads",
  description: "How Naija Ads handles data: minimization, no ad personalization, publisher privacy duties under NDPR.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Privacy</h1>
      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">No personalization, by design</h2>
        <p className="text-sm text-muted">
          Naija Ads targets by app category, country, and format — never by personal profile. There
          is no behavioural audience to opt out of, so there is no consent gate; there is simply no
          personal data collected to gate.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">What we store</h2>
        <p className="text-sm text-muted">
          Account identities (via Google sign-in), business and app declarations, campaign and
          creative records, and aggregate ad events (requests, impressions, clicks, completions) with
          server receipt times. Event rows carry no IP addresses. Client timestamps are diagnostic
          only.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">Fraud processing is transient</h2>
        <p className="text-sm text-muted">
          Rate-limit counters and anomaly signals live in short-lived cache with TTLs. They expire;
          they are never a second database of user behaviour.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold text-ink">Publisher duties (NDPR)</h2>
        <p className="text-sm text-muted">
          Developers publishing ads must carry their own app privacy policy disclosing that ads are
          served by Naija Ads, what aggregate measurement exists, and how users can contact them.
          Apps without a policy fail verification.
        </p>
      </section>
    </div>
  );
}
