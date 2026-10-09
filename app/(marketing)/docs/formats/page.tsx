import type { Metadata } from "next";
import { AdTypeCard } from "@/components/AdTypeCard";
import type { AdType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Formats & placements — Naija Ads docs",
  description: "Banner sizes, adaptive slots, interstitial, rewarded video, and audio placement rules.",
};

const FORMATS: Array<{ adType: AdType; name: string; body: string }> = [
  {
    adType: "banner",
    name: "Banner",
    body: "Fixed sizes 320×50, 320×100, 300×250. Adaptive placements report slot_width_dp and the server serves the first preferred size that fits. Size never affects price. GIF is a banner subtype: exact canonical size, adaptive placements only.",
  },
  {
    adType: "interstitial",
    name: "Interstitial",
    body: "Full-screen static or short video. Static and video share one format floor. Video events on interstitials are analytics-only — no reward.",
  },
  {
    adType: "rewarded",
    name: "Rewarded video",
    body: "Opt-in video to completion. Rewards validate server-side against video duration with single-use tokens; replays return the recorded result without a second grant.",
  },
  {
    adType: "audio",
    name: "Audio",
    body: "MP3/AAC with a companion banner (audio placements carry no size — the banner does). Completion events are analytics-only, like interstitial video.",
  },
] as const;

export default function FormatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Formats &amp; placements</h1>
      <p className="max-w-2xl text-muted">
        Create one placement per format slot in your app. Every placement has a unique ID plus an
        explicit format — the server rejects mismatched ad requests.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FORMATS.map((f) => (
          <AdTypeCard key={f.name} adType={f.adType} name={f.name} />
        ))}
      </div>
      <div className="space-y-3">
        {FORMATS.map((f) => (
          <section key={f.name} className="rounded-card border border-mist bg-white p-4">
            <h2 className="font-display font-semibold text-ink">{f.name}</h2>
            <p className="text-sm text-muted">{f.body}</p>
          </section>
        ))}
      </div>
      <p className="text-sm text-muted">
        Frequency caps apply per session. Refresh and impression rules belong in your placement
        settings, not in client timers.
      </p>
    </div>
  );
}
