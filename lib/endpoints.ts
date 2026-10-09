// Every dashboard path in one place. `spec23` entries are listed verbatim in
// the MVP spec §23 API Surface. `assumed` entries sit inside the documented
// /api/v1/admin/... family (AGENTS.md §4) but their exact names are not in the
// spec — the backend owns those and renames need a cross-repo RFC, not a search
// and replace across pages.

import type { ChartRange } from "./ranges";

export const endpoints = {
  authLogin: "/api/v1/auth/login",
  campaigns: "/api/v1/campaigns",
  creatives: "/api/v1/creatives",
  businesses: "/api/v1/businesses",
  developers: "/api/v1/developers",
  apps: "/api/v1/apps",
  placements: "/api/v1/placements",
  payments: "/api/v1/payments",
  earnings: "/api/v1/earnings",
  payouts: "/api/v1/payouts",
  analytics: "/api/v1/analytics",
} as const;

// §23 lists only the `/api/v1/admin` family, so every path below is an assumed
// name inside it. The backend owns these; a rename is a one-file change here.
export const adminEndpoints = {
  businesses: "/api/v1/admin/businesses",
  developers: "/api/v1/admin/developers",
  apps: "/api/v1/admin/apps",
  campaigns: "/api/v1/admin/campaigns",
  creatives: "/api/v1/admin/creatives",
  payments: "/api/v1/admin/payments",
  payouts: "/api/v1/admin/payouts",
  // Approve/reject for any queue: { kind, id, decision, reason? } (spec §30).
  decision: "/api/v1/admin/reviews/decision",
  fraudAlerts: "/api/v1/admin/fraud-alerts",
  auditLogs: "/api/v1/admin/audit-logs",
} as const;

// §23 documents /api/v1/payouts. The payout *account* behind it maps to the
// developer_payout_accounts entity (§19) but its path is not named in the spec.
export const payoutEndpoints = {
  account: "/api/v1/payouts/account",
} as const;

// AGENTS.md §4 documents the flow (ask for a presigned R2 URL -> PUT the file
// -> confirm metadata) but not the path names.
export const creativeEndpoints = {
  uploadIntent: "/api/v1/creatives/upload-intent",
  confirm: "/api/v1/creatives",
} as const;

export function analyticsFor(scope: "business" | "developer", range?: ChartRange): string {
  // `range` (7d/30d/90d/6m) is an assumed param inside the documented
  // `/api/v1/analytics?...` family: the backend owns the grain it serves per
  // range (daily/daily/weekly/monthly) and the frontend renders it as-is.
  const base = `${endpoints.analytics}?scope=${scope}`;
  return range ? `${base}&range=${range}` : base;
}
