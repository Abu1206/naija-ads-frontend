import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Web SDK — Naija Ads docs",
  description: "Request ads and report impression, click, and reward events from the web SDK.",
};

export default function WebSdkPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Web SDK</h1>
      <p className="max-w-2xl text-gray-600">
        The SDK sends identity and context; the server decides the winner, the price, and the
        reward. Never trust client-computed money.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">1. Request an ad</h2>
        <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
{`POST /v1/ads/request
{
  "app_id": "...",
  "placement_id": "...",
  "ad_type": "rewarded",
  "session_id": "...",
  "mode": "live",
  "context": {
    "country": "NG",
    "category": "games",
    "slot_width_dp": 360,
    "device_type": "phone"
  }
}`}
        </pre>
        <p className="text-sm text-gray-600">
          <code>ad_type</code> is one of <code>banner</code>, <code>interstitial</code>,{" "}
          <code>rewarded</code>, <code>audio</code>. The response carries the creative URL and a{" "}
          <code>click_url</code> bound to the served impression — open the served URL, never build
          your own.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">2. Report events in order</h2>
        <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
{`POST /v1/ads/events
{ "event_type": "IMPRESSION", ... }
{ "event_type": "CLICK", "ad_impression_id": "...", ... }
{ "event_type": "REWARD_CONFIRMED", ... }  // rewarded only, after server validation`}
        </pre>
        <p className="text-sm text-gray-600">
          A click must reference its served impression or it is rejected. Rewarded completion is
          confirmed server-side — <code>video_completed</code> is not a reward until the backend
          says so.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">3. Ship with test mode first</h2>
        <p className="text-sm text-gray-600">
          Develop with <code>mode: &quot;test&quot;</code> (see{" "}
          <Link href="/docs/test-mode" className="underline">
            test mode
          </Link>
          ), then flip to <code>live</code> for production.
        </p>
      </section>
    </div>
  );
}
