// Campaign status filter vocabulary, shared by the server page (which reads
// the URL) and the client filter (which writes it). Pure and server-safe: no
// component or navigation imports here.

/** Statuses in the table filter menu, live first. */
export const STATUS_FILTER_ORDER = [
  "active",
  "paused",
  "submitted",
  "under_review",
  "draft",
  "rejected",
] as const;

export type StatusFilter = (typeof STATUS_FILTER_ORDER)[number] | "all";

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All",
  active: "Active",
  paused: "Paused",
  submitted: "Submitted",
  under_review: "Under review",
  draft: "Draft",
  rejected: "Rejected",
};

/** Unknown or missing params fall back to the full table, never an empty one. */
export function parseStatusFilter(value: unknown): StatusFilter {
  if (value === "all" || (STATUS_FILTER_ORDER as readonly string[]).includes(value as string)) {
    return value as StatusFilter;
  }
  return "all";
}
