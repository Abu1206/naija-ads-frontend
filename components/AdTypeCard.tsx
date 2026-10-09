import type { AdType } from "@/lib/types";

// Flat format shapes on a green-tint ground (design-system.md). No imagery,
// no gradients — a simple geometric hint of each format.
function FormatShape({ adType }: { adType: AdType }) {
  const shape = "bg-naija/80";
  switch (adType) {
    case "banner":
      return (
        <span className="flex h-16 items-center justify-center" aria-hidden="true">
          <span className={`h-6 w-28 rounded-sm ${shape}`} />
        </span>
      );
    case "interstitial":
      return (
        <span className="flex h-16 items-center justify-center" aria-hidden="true">
          <span className={`h-12 w-9 rounded-sm ${shape}`} />
        </span>
      );
    case "rewarded":
      return (
        <span className="flex h-16 items-center justify-center" aria-hidden="true">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${shape}`}>
            <span className="h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-white" />
          </span>
        </span>
      );
    case "audio":
      return (
        <span className="flex h-16 items-end justify-center gap-1 pb-2" aria-hidden="true">
          {[10, 22, 16, 28, 12].map((h, i) => (
            <span key={i} className={`w-1.5 rounded-full ${shape}`} style={{ height: h }} />
          ))}
        </span>
      );
  }
}

/**
 * Ad format card: flat shape, name, minimum CPM. Real minimum prices come from
 * admin settings — until they are set the design shows a placeholder, never a
 * made-up number.
 */
export function AdTypeCard({ adType, name, minCpm }: { adType: AdType; name: string; minCpm?: string }) {
  return (
    <div className="rounded-card border border-mist bg-white p-4">
      <div className="rounded-lg bg-mint">
        <FormatShape adType={adType} />
      </div>
      <p className="mt-3 font-display font-semibold text-ink">{name}</p>
      <p className="mt-1 text-xs text-muted">
        {minCpm ? `From ${minCpm} per 1,000 views` : "Minimum price per 1,000 views: to be set"}
      </p>
    </div>
  );
}
