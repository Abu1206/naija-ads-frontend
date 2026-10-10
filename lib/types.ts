// Mirrors backend contracts exactly: entity names follow the spec's PostgreSQL
// data model (§19) and status ladders follow §9.3, §12 and §17. Field names
// match the Go server (app_id, placement_id, ad_type, event_id…).
// Renames need a cross-repo RFC.

export type Role = "business" | "developer" | "admin";

// Four served formats (AGENTS.md §3 and the /docs formats page, which spells out
// audio placement rules). One source so no form can offer a subset of the contract.
export const AD_TYPES = ["banner", "interstitial", "rewarded", "audio"] as const;
export type AdType = (typeof AD_TYPES)[number];

export type CampaignObjective = "impressions" | "clicks";

// spec §12: DRAFT -> SUBMITTED -> UNDER_REVIEW -> REJECTED | APPROVED -> ACTIVE.
// `paused` is the enforcement lever in the marketplace terms (warning -> pause -> revoke).
export type CampaignStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "rejected"
  | "approved"
  | "active"
  | "paused";

export type CreativeStatus = "draft" | "submitted" | "under_review" | "rejected" | "approved";

// spec §9.3.
export type VerificationStatus = "pending" | "approved" | "rejected";

// spec §17.
export type EarningStatus =
  | "pending"
  | "validated"
  | "available"
  | "payout_requested"
  | "processing"
  | "paid";

export type PayoutStatus = "pending_review" | "processing" | "paid" | "rejected";

export interface Business {
  id: string;
  name: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Developer {
  id: string;
  display_name: string;
  profile_type: "individual" | "studio";
  studio_name: string;
  website: string;
  country_code: string;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  ad_type: AdType;
  total_budget_kobo: number;
  daily_budget_kobo: number;
  spend_kobo: number;
  remaining_budget_kobo: number;
  impressions: number;
  clicks: number;
  destination_url: string;
  created_at: string;
}

export interface Creative {
  id: string;
  campaign_id: string;
  ad_type: AdType;
  status: CreativeStatus;
  file_url: string;
  width: number;
  height: number;
  size_bytes: number;
  created_at: string;
}

export interface App {
  app_id: string;
  developer_id: string;
  name: string;
  platform: string;
  category: string;
  package_name: string;
  age_rating: string;
  status: VerificationStatus;
  created_at: string;
}

export interface Placement {
  placement_id: string;
  app_id: string;
  name: string;
  ad_type: AdType;
}

export interface Payment {
  id: string;
  business_id: string;
  amount_kobo: number;
  status: "pending" | "confirmed" | "failed";
  checkout_url: string;
  reference: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  account_id: string;
  amount_kobo: number;
  direction: "credit" | "debit";
  kind: string;
  created_at: string;
}

export interface DeveloperEarning {
  id: string;
  developer_id: string;
  app_id: string;
  ad_type: AdType;
  impressions: number;
  revenue_kobo: number;
  status: EarningStatus;
  period: string;
}

export interface Payout {
  id: string;
  developer_id: string;
  amount_kobo: number;
  status: PayoutStatus;
  requested_at: string;
  paid_at: string | null;
}

export interface FraudAlert {
  id: string;
  kind: "request_rate" | "click_rate" | "reward_completion" | "traffic_spike";
  severity: "low" | "medium" | "high";
  subject: string;
  detail: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  created_at: string;
}

// GET /api/v1/analytics?scope=business|developer
export interface AnalyticsSummary {
  impressions: number;
  clicks: number;
  spend_kobo: number;
  remaining_budget_kobo: number;
  revenue_kobo: number;
  ad_requests: number;
  filled: number;
  by_format: Partial<Record<AdType, { impressions: number; clicks: number; revenue_kobo: number }>>;
  series: { period: string; impressions: number; clicks: number }[];
  /**
   * Totals for the equal-length window immediately before this one — the
   * baseline for window deltas ("vs previous 30 days"). Null when the
   * history is too short for a comparison. `spend_kobo` is an assumed
   * backend field (the spec names the endpoint, not its shape): the mock
   * serves it so spend deltas window like impression deltas.
   */
  previous_window: { impressions: number; clicks: number; spend_kobo?: number } | null;
}

export interface FieldErrors {
  [field: string]: string[];
}

export class ApiError extends Error {
  status: number;
  fields?: FieldErrors;

  constructor(status: number, message: string, fields?: FieldErrors) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
