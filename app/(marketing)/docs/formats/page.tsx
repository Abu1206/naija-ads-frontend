import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formats & placements — Naija Ads docs",
  description: "Banner sizes, adaptive slots, interstitial, rewarded video, and audio placement rules.",
};

const FORMATS = [
  {
    name: "Banner",
    body: "Fixed sizes 320×50, 320×100, 300×250. Adaptive placements report slot_width_dp and the server serves the first preferred size that fits. Size never affects price. GIF is a banner subtype: exact canonical size, adaptive placements only.",
  },
  {
    name: "Interstitial",
    body: "Full-screen static or short video. Static and video share one format floor. Video events on interstitials are analytics-only — no reward.",
  },
  {
    name: "Rewarded video",
    body: "Opt-in video to completion. Rewards validate server-side against video duration with single-use tokens; replays return the recorded result without a second grant.",
  },
  {
    name: "Audio",
    body: "MP3/AAC with a companion banner (audio placements carry no size — the banner does). Completion events are analytics-only, like interstitial video.",
  },
] as const;

export default function FormatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Formats &amp; placements</h1>
      <p className="max-w-2xl text-gray-600">
        Create one placement per format slot in your app. Every placement has a unique ID plus an
        explicit format — the server rejects mismatched ad requests.
      </p>
      <div className="space-y-3">
        {FORMATS.map((f) => (
          <section key={f.name} className="rounded border bg-white p-4">
            <h2 className="font-medium">{f.name}</h2>
            <p className="text-sm text-gray-600">{f.body}</p>
          </section>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        Frequency caps apply per session. Refresh and impression rules belong in your placement
        settings, not in client timers.
      </p>
    </div>
  );
}
