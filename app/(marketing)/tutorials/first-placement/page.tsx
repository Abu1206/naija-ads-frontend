import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Monetize your first placement — Naija Ads tutorials",
  description: "Developer walkthrough: app registration, placement creation, web SDK integration in test mode, first live impression.",
};

const STEPS = [
  { title: "Sign up and verify", body: "Go to /signup as a developer, complete display name, country, phone, and profile type (individual or studio) at /developer/onboarding, then submit for manual approval." },
  { title: "Register your app", body: "At /developer/apps add your app and declare its category honestly — bids match against it and category-integrity checks flag mismatches." },
  { title: "Create a placement", body: "At /developer/placements add one placement per format slot (banner, interstitial, rewarded, audio). Save the placement_id and keep secrets server-side." },
  { title: "Integrate in test mode", body: "Follow /docs/web-sdk with mode: \"test\". Confirm the creative renders, the click opens the served click_url, and rewarded completions confirm." },
  { title: "Flip to live", body: "Switch to mode: \"live\" in production builds. Test traffic never touched money, so nothing carries over." },
  { title: "Watch earnings", body: "Impressions, fill rate, and estimated revenue appear at /developer/earnings. Payouts unlock once earnings validate — approval is manual for MVP." },
] as const;

export default function FirstPlacementTutorialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Monetize your first placement</h1>
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-card border border-mist bg-white p-4">
            <p className="font-medium">
              {i + 1}. {s.title}
            </p>
            <p className="text-sm text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">
        Reference alongside: <Link href="/docs/web-sdk" className="underline">web SDK</Link> ·{" "}
        <Link href="/docs/formats" className="underline">formats & placements</Link> ·{" "}
        <Link href="/docs/test-mode" className="underline">test mode</Link>.
      </p>
    </div>
  );
}
