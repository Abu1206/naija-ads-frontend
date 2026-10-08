// Tones follow the spec ladders: §9.3 verification, §12 campaign review,
// §17 earnings and payouts. Text always accompanies colour (no colour-only meaning).
const STATUS_STYLES: Record<string, string> = {
  active: "bg-brand/10 text-brand-strong",
  approved: "bg-brand/10 text-brand-strong",
  confirmed: "bg-brand/10 text-brand-strong",
  validated: "bg-brand/10 text-brand-strong",
  available: "bg-brand/10 text-brand-strong",
  paid: "bg-brand/10 text-brand-strong",
  low: "bg-gray-100 text-gray-700",
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-800",
  under_review: "bg-yellow-100 text-yellow-800",
  pending: "bg-yellow-100 text-yellow-800",
  pending_review: "bg-yellow-100 text-yellow-800",
  paused: "bg-yellow-100 text-yellow-800",
  processing: "bg-yellow-100 text-yellow-800",
  payout_requested: "bg-yellow-100 text-yellow-800",
  medium: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  high: "bg-red-100 text-red-700",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
