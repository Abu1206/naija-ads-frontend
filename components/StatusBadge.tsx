// Tones follow the spec ladders: §9.3 verification, §12 campaign review,
// §17 earnings and payouts — rendered per design-system.md as pills with a
// dot. Pending is gold tint, approved is green tint, rejected is red tint,
// fraud-flagged is Ink with white text. Text always accompanies colour
// (no colour-only meaning).
const STATUS_STYLES: Record<string, string> = {
  active: "bg-mint text-pine",
  approved: "bg-mint text-pine",
  confirmed: "bg-mint text-pine",
  validated: "bg-mint text-pine",
  available: "bg-mint text-pine",
  paid: "bg-mint text-pine",
  low: "border border-mist bg-cloud text-muted",
  draft: "border border-mist bg-cloud text-muted",
  submitted: "bg-sand text-ink",
  under_review: "bg-sand text-ink",
  pending: "bg-sand text-ink",
  pending_review: "bg-sand text-ink",
  paused: "bg-sand text-ink",
  processing: "bg-sand text-ink",
  payout_requested: "bg-sand text-ink",
  medium: "bg-sand text-ink",
  rejected: "bg-blush text-alert",
  failed: "bg-blush text-alert",
  high: "bg-blush text-alert",
  flagged: "bg-ink text-white",
  fraud: "bg-ink text-white",
};

const DOT_STYLES: Record<string, string> = {
  active: "bg-naija",
  approved: "bg-naija",
  confirmed: "bg-naija",
  validated: "bg-naija",
  available: "bg-naija",
  paid: "bg-naija",
  low: "bg-muted",
  draft: "bg-muted",
  submitted: "bg-gold",
  under_review: "bg-gold",
  pending: "bg-gold",
  pending_review: "bg-gold",
  paused: "bg-gold",
  processing: "bg-gold",
  payout_requested: "bg-gold",
  medium: "bg-gold",
  rejected: "bg-alert",
  failed: "bg-alert",
  high: "bg-alert",
  flagged: "bg-gold",
  fraud: "bg-gold",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "border border-mist bg-cloud text-muted";
  const dot = DOT_STYLES[status] ?? "bg-muted";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
      aria-label={`Status: ${label}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
