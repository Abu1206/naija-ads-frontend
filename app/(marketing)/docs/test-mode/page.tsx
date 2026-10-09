import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Test mode — Naija Ads docs",
  description: "Use mode test to verify ad rendering with zero ledger or earnings writes.",
};

export default function TestModePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Test mode</h1>
      <p className="max-w-2xl text-muted">
        Send <code>mode: &quot;test&quot;</code> on ad requests and events while integrating. Test
        traffic renders real creatives and appears on your dashboard — and writes zero ledger
        entries and zero earnings. It can never fund, spend, or pay out.
      </p>
      <ul className="space-y-3">
        <li className="rounded-card border border-mist bg-white p-4">
          <p className="font-medium">Integrate with test first</p>
          <p className="text-sm text-muted">
            Verify every format renders, clicks open the served <code>click_url</code>, and rewards
            confirm — before touching <code>mode: &quot;live&quot;</code>.
          </p>
        </li>
        <li className="rounded-card border border-mist bg-white p-4">
          <p className="font-medium">Ship live explicitly</p>
          <p className="text-sm text-muted">
            Production builds send <code>mode: &quot;live&quot;</code>. The server resolves the
            winning bid itself; neither mode influences pricing.
          </p>
        </li>
      </ul>
      <Link href="/tutorials/first-placement" className="text-sm underline">
        Walk through it in the first-placement tutorial →
      </Link>
    </div>
  );
}
