// Mirrors backend contracts exactly. Field names match the Go server
// (app_id, placement_id, ad_type, event_id…). Renames need a cross-repo RFC.

export type Role = "business" | "developer" | "admin";

export type AdType = "banner" | "interstitial" | "rewarded";

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  status: "draft" | "pending_review" | "active" | "paused" | "rejected";
  budget_kobo: number;
  spend_kobo: number;
  created_at: string;
}

export interface Creative {
  id: string;
  campaign_id: string;
  ad_type: AdType;
  status: "pending_review" | "approved" | "rejected";
  file_url: string;
  created_at: string;
}

export interface App {
  app_id: string;
  developer_id: string;
  name: string;
  platform: string;
  status: string;
  created_at: string;
}

export interface Placement {
  placement_id: string;
  app_id: string;
  ad_type: AdType;
  name: string;
}

export interface Payment {
  id: string;
  business_id: string;
  amount_kobo: number;
  status: "pending" | "confirmed" | "failed";
  checkout_url: string;
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
