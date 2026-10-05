const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  paused: "bg-yellow-100 text-yellow-800",
  pending: "bg-yellow-100 text-yellow-800",
  pending_review: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

interface StatusBadgeProps {
  status: string;
}

/** Status pill with text label (never color-only meaning). */
export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
