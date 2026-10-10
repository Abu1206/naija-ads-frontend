// In-memory fixture store: the server-side "backend" while the Go API is
// undeployed.
//
// Why a route handler and not direct mutation: `apiFetch` is called from `"use
// client"` components, so it runs in the browser. `load()` runs on the server.
// Only the server can share one mutable store between the two, so every write
// is POSTed to a dev route handler that applies it here. Reads resolve directly
// because a server component already runs where the store lives.
//
// In-memory by design (per the team's choice): a reload reseeds. The store is
// parked on `globalThis` so a Next.js dev reload does not resurrect seed data
// over what you just created.

import type {
  App,
  AuditLog,
  Business,
  Campaign,
  Creative,
  Developer,
  DeveloperEarning,
  FraudAlert,
  LedgerEntry,
  Payment,
  Payout,
  Placement,
} from "@/lib/types";
import { isRole, roleFromLoginEmail } from "./session";
import { parseChartRange, type ChartRange } from "@/lib/ranges";
import { toWeekly, type MockSeriesPoint } from "./series";
import {
  apps as seedApps,
  auditLogs as seedAuditLogs,
  businesses as seedBusinesses,
  businessAnalytics,
  businessDaily,
  businessSeries,
  campaigns as seedCampaigns,
  creatives as seedCreatives,
  CURRENT_BUSINESS_ID,
  CURRENT_DEVELOPER_ID,
  developerAnalytics,
  developerDaily,
  developerSeries,
  developers as seedDevelopers,
  earnings as seedEarnings,
  fraudAlerts as seedFraudAlerts,
  ledger as seedLedger,
  payments as seedPayments,
  payouts as seedPayouts,
  placements as seedPlacements,
} from "./data";

interface Store {
  businesses: Business[];
  developers: Developer[];
  apps: App[];
  placements: Placement[];
  campaigns: Campaign[];
  creatives: Creative[];
  payments: Payment[];
  payouts: Payout[];
  earnings: DeveloperEarning[];
  ledger: LedgerEntry[];
  fraudAlerts: FraudAlert[];
  auditLogs: AuditLog[];
}

const globalStore = globalThis as typeof globalThis & { __naijaMockStore?: Store };

function createStore(): Store {
  return {
    businesses: [...seedBusinesses],
    developers: [...seedDevelopers],
    apps: [...seedApps],
    placements: [...seedPlacements],
    campaigns: [...seedCampaigns],
    creatives: [...seedCreatives],
    payments: [...seedPayments],
    payouts: [...seedPayouts],
    earnings: [...seedEarnings],
    ledger: [...seedLedger],
    fraudAlerts: [...seedFraudAlerts],
    auditLogs: [...seedAuditLogs],
  };
}

export function store(): Store {
  globalStore.__naijaMockStore ??= createStore();
  return globalStore.__naijaMockStore;
}

/** Wipes mutations back to the seed. Dev convenience only. */
export function resetStore(): void {
  globalStore.__naijaMockStore = createStore();
}

// ---------------------------------------------------------------------------
// Scoping
// ---------------------------------------------------------------------------

// The Go server scopes every list to the authenticated account. With no auth to
// scope against, the fixtures carry one signed-in business and one signed-in
// developer; these filters reproduce what the server would send each of them.
// The `/api/v1/admin/*` family returns everything, which is the point of it.

// Business, Developer, Payment, Payout and Earning all carry an owner column.
// Campaign and Creative are reached through the business that owns the campaign.

function ownedByCampaignBusiness(campaignId: string): boolean {
  return store().campaigns.some((c) => c.id === campaignId && c.business_id === CURRENT_BUSINESS_ID);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Strips the query string: `analyticsFor()` appends `?scope=…`. */
function pathname(path: string): string {
  const [clean] = path.split("?");
  return clean.replace(/\/$/, "") || "/";
}

function scopeParam(path: string): string | null {
  const query = path.split("?")[1];
  if (!query) return null;
  return new URLSearchParams(query).get("scope");
}

/**
 * Windowed series for the ranged chart. Totals and by_format stay all-time —
 * only the series is windowed, the way the backend scopes a ranged query.
 * Unknown or missing ranges fall back to the monthly series (the pre-range
 * behaviour), so old callers keep working.
 */
function windowSums(points: MockSeriesPoint[]) {
  if (points.length === 0) return null;
  return {
    impressions: points.reduce((sum, p) => sum + p.impressions, 0),
    clicks: points.reduce((sum, p) => sum + p.clicks, 0),
  };
}

/** Growth the fixtures already show month to month (business ~+29%, developer ~+24%). */
const MONTHLY_GROWTH = { business: 1.29, developer: 1.24 } as const;
const MONTHLY_CTR = { business: 0.0325, developer: 0.0147 } as const;

/**
 * The six months before the fixture's first month, back-projected from its own
 * growth rate — consistent with the trend the monthly series already shows, so
 * a "vs previous 6 months" delta reads as the same account growing.
 */
function priorSixMonths(scope: "business" | "developer") {
  const first = (scope === "developer" ? developerSeries : businessSeries)[0]!;
  // Six prior months, oldest→newest, back-projected at the fixture's growth.
  const months: number[] = [];
  let running = first.impressions;
  for (let i = 1; i <= 6; i++) {
    running = Math.round(running / MONTHLY_GROWTH[scope]);
    months.push(running);
  }
  const total = months.reduce((a, b) => a + b, 0);
  return { impressions: total, clicks: Math.round(total * MONTHLY_CTR[scope]) };
}

/**
 * The equal-length window immediately before the requested one — the baseline
 * for window deltas ("vs previous 30 days"). 7D/30D/90D slice the daily
 * history; 6M back-projects the fixtures. Null when history is too short.
 */
function priorWindow(scope: "business" | "developer", range: ChartRange) {
  const daily = scope === "developer" ? developerDaily : businessDaily;
  switch (range) {
    case "7d":
      return windowSums(daily.slice(-14, -7));
    case "30d":
      return windowSums(daily.slice(-60, -30));
    case "90d":
      return windowSums(toWeekly(daily.slice(0, 91)));
    case "6m":
      return priorSixMonths(scope);
  }
}

function rangedAnalytics(scope: "business" | "developer", path: string) {
  const query = path.split("?")[1] ?? "";
  const base = scope === "developer" ? developerAnalytics : businessAnalytics;
  const daily = scope === "developer" ? developerDaily : businessDaily;
  const raw = new URLSearchParams(query).get("range");
  // Absent range = legacy caller (e.g. the admin overview): the monthly
  // series as-is, and no window baseline — it asked for no window.
  if (raw === null) return base;
  const range = parseChartRange(raw);
  const previous_window = priorWindow(scope, range);
  switch (range) {
    case "7d":
      return { ...base, series: daily.slice(-7), previous_window };
    case "30d":
      return { ...base, series: daily.slice(-30), previous_window };
    case "90d":
      return { ...base, series: toWeekly(daily), previous_window };
    case "6m":
      return { ...base, previous_window };
  }
}

/**
 * Resolves a `load()` path to fixture data. Returns `null` when nothing matches
 * — the caller then renders its own "no data" state rather than inventing one.
 */
export function mockRead<T>(path: string): T | null {
  const s = store();
  const clean = pathname(path);
  const scope = scopeParam(path);

  switch (clean) {
    case "/api/v1/analytics":
      if (scope === "developer") return rangedAnalytics("developer", path) as T;
      return rangedAnalytics("business", path) as T;
    case "/api/v1/campaigns":
      return s.campaigns.filter((c) => c.business_id === CURRENT_BUSINESS_ID) as T;
    case "/api/v1/creatives":
      // The server scopes creatives through the caller's campaigns.
      return s.creatives.filter((c) => ownedByCampaignBusiness(c.campaign_id)) as T;
    case "/api/v1/apps":
      return s.apps.filter((a) => a.developer_id === CURRENT_DEVELOPER_ID) as T;
    case "/api/v1/placements":
      return s.placements.filter((p) =>
        s.apps.some((a) => a.app_id === p.app_id && a.developer_id === CURRENT_DEVELOPER_ID),
      ) as T;
    case "/api/v1/payments":
      return s.payments.filter((p) => p.business_id === CURRENT_BUSINESS_ID) as T;
    case "/api/v1/payouts":
      return s.payouts.filter((p) => p.developer_id === CURRENT_DEVELOPER_ID) as T;
    case "/api/v1/earnings":
      return s.earnings.filter((e) => e.developer_id === CURRENT_DEVELOPER_ID) as T;
    case "/api/v1/businesses":
      return s.businesses.filter((b) => b.id === CURRENT_BUSINESS_ID) as T;
    case "/api/v1/developers":
      return s.developers.filter((d) => d.id === CURRENT_DEVELOPER_ID) as T;
    case "/api/v1/payouts/account":
      return { developer_id: CURRENT_DEVELOPER_ID, bank_code: "044", account_number: "0123456789", account_name: "OKONKWO ADA", country_code: "NG" } as T;
    case "/api/v1/admin/businesses":
      return s.businesses as T;
    case "/api/v1/admin/developers":
      return s.developers as T;
    case "/api/v1/admin/apps":
      return s.apps as T;
    case "/api/v1/admin/campaigns":
      return s.campaigns as T;
    case "/api/v1/admin/creatives":
      return s.creatives as T;
    case "/api/v1/admin/payments":
      return s.payments as T;
    case "/api/v1/admin/payouts":
      return s.payouts as T;
    case "/api/v1/admin/fraud-alerts":
      return s.fraudAlerts as T;
    case "/api/v1/admin/audit-logs":
      return s.auditLogs as T;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "item";
}

function id(prefix: string, value: string): string {
  return `${prefix}_${slug(value)}_${Math.random().toString(36).slice(2, 6)}`;
}

const now = () => new Date().toISOString();

interface WriteResult {
  status: number;
  body: unknown;
}

/**
 * Applies a write the way the backend would. Only the fields the Go server owns
 * are guessed, and their default is always the *pending* end of a status ladder
 * — never an approval, never a money total the client did not send.
 */
export function mockWrite(path: string, body: unknown): WriteResult {
  const s = store();
  const clean = pathname(path);
  const data = (body ?? {}) as Record<string, unknown>;

  switch (clean) {
    // --- Auth. The route handler sets the cookie; this only resolves the role
    // --- so the login form can redirect exactly as it does against the server.
    case "/api/v1/auth/login": {
      const role = isRole(data.role) ? data.role : roleFromLoginEmail(String(data.email ?? ""));
      return { status: 200, body: { role } };
    }

    case "/api/v1/campaigns": {
      const total = Number(data.total_budget_kobo ?? 0);
      const created: Campaign = {
        id: id("cmp", String(data.name ?? "campaign")),
        business_id: CURRENT_BUSINESS_ID,
        name: String(data.name ?? "Untitled campaign"),
        objective: data.objective === "clicks" ? "clicks" : "impressions",
        status: "draft",
        ad_type: (["banner", "interstitial", "rewarded", "audio"] as const).includes(data.ad_type as never)
          ? (data.ad_type as Campaign["ad_type"])
          : "banner",
        total_budget_kobo: total,
        daily_budget_kobo: Number(data.daily_budget_kobo ?? 0),
        spend_kobo: 0,
        // A new campaign has spent nothing, so the remainder is the budget the
        // advertiser typed. This echoes an input; it does not derive a balance.
        remaining_budget_kobo: total,
        impressions: 0,
        clicks: 0,
        destination_url: String(data.destination_url ?? ""),
        created_at: now(),
      };
      s.campaigns.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/apps": {
      const created: App = {
        app_id: `app_${slug(String(data.name ?? "app"))}`,
        developer_id: CURRENT_DEVELOPER_ID,
        name: String(data.name ?? "Untitled app"),
        platform: String(data.platform ?? "android"),
        category: String(data.category ?? ""),
        package_name: String(data.package_name ?? ""),
        age_rating: String(data.age_rating ?? "everyone"),
        // Apps enter as pending: approval is a manual admin decision (§6.3).
        status: "pending",
        created_at: now(),
      };
      s.apps.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/placements": {
      const created: Placement = {
        placement_id: `plc_${slug(String(data.name ?? "placement"))}`,
        app_id: String(data.app_id ?? ""),
        name: String(data.name ?? "Untitled placement"),
        ad_type: (["banner", "interstitial", "rewarded", "audio"] as const).includes(data.ad_type as never)
          ? (data.ad_type as Placement["ad_type"])
          : "banner",
      };
      s.placements.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/creatives/upload-intent": {
      const creativeId = id("crv", String(data.file_name ?? "creative"));
      return {
        status: 200,
        // Points at the dev upload route, which accepts the bytes and discards
        // them. The presigned-PUT contract (AGENTS.md §4) is unchanged.
        body: { creative_id: creativeId, upload_url: "/api/dev/upload" },
      };
    }

    case "/api/v1/creatives": {
      const target = s.creatives.find((c) => c.id === String(data.creative_id));
      if (target) {
        target.status = "submitted";
        return { status: 200, body: target };
      }
      const created: Creative = {
        id: String(data.creative_id ?? id("crv", "creative")),
        campaign_id: String(data.campaign_id ?? ""),
        ad_type: (["banner", "interstitial", "rewarded", "audio"] as const).includes(data.ad_type as never)
          ? (data.ad_type as Creative["ad_type"])
          : "banner",
        status: "submitted",
        file_url: "https://cdn.naijaads.ng/creatives/local-upload.png",
        width: Number(data.width ?? 0),
        height: Number(data.height ?? 0),
        size_bytes: Number(data.size_bytes ?? 0),
        created_at: now(),
      };
      s.creatives.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/payments": {
      const created: Payment = {
        id: `pay_${Math.random().toString(36).slice(2, 8)}`,
        business_id: CURRENT_BUSINESS_ID,
        amount_kobo: Number(data.amount_kobo ?? 0),
        // Always pending: a redirect is not a credit. The webhook confirms it.
        status: "pending",
        checkout_url: `https://checkout.bachs.ng/pay/${Math.random().toString(36).slice(2, 10)}`,
        reference: `BACHS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        created_at: now(),
      };
      s.payments.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/payouts": {
      const created: Payout = {
        id: `po_${Math.random().toString(36).slice(2, 8)}`,
        developer_id: CURRENT_DEVELOPER_ID,
        amount_kobo: Number(data.amount_kobo ?? 0),
        status: "pending_review",
        requested_at: now(),
        paid_at: null,
      };
      s.payouts.unshift(created);
      return { status: 201, body: created };
    }

    case "/api/v1/payouts/account":
      return { status: 200, body: { developer_id: CURRENT_DEVELOPER_ID, bank_code: "044", account_number: "0123456789", account_name: "OKONKWO ADA", country_code: "NG" } };

    // Profiles: the backend stores the declaration and sets verification to
    // pending; the decision itself is a manual admin step.
    case "/api/v1/businesses": {
      const target = s.businesses.find((b) => b.id === CURRENT_BUSINESS_ID);
      if (target) Object.assign(target, data, { verification_status: "pending" });
      return { status: 200, body: target ?? null };
    }

    case "/api/v1/developers": {
      const target = s.developers.find((d) => d.id === CURRENT_DEVELOPER_ID);
      if (target) Object.assign(target, data, { verification_status: "pending" });
      return { status: 200, body: target ?? null };
    }

    case "/api/v1/admin/reviews/decision": {
      const { kind, id: targetId, decision } = data as { kind?: string; id?: string; decision?: string };
      const next = decision === "approve" ? "approved" : "rejected";

      // Every collection keys on its own field (App uses app_id), so the
      // lookup is spelled out per kind instead of forced into one shape.
      let found = false;
      if (kind === "business") {
        const t = s.businesses.find((b) => b.id === targetId);
        if (t) { t.verification_status = next; found = true; }
      } else if (kind === "developer") {
        const t = s.developers.find((d) => d.id === targetId);
        if (t) { t.verification_status = next; found = true; }
      } else if (kind === "app") {
        const t = s.apps.find((a) => a.app_id === targetId);
        if (t) { t.status = next; found = true; }
      } else if (kind === "campaign") {
        const t = s.campaigns.find((c) => c.id === targetId);
        if (t) { t.status = next; found = true; }
      } else if (kind === "creative") {
        const t = s.creatives.find((c) => c.id === targetId);
        if (t) { t.status = next; found = true; }
      }

      if (!found) return { status: 404, body: { message: "Review target not found." } };

      s.auditLogs.unshift({
        id: `aud_${Math.random().toString(36).slice(2, 8)}`,
        actor: "admin:you@naijaads.ng",
        action: `${decision === "approve" ? "approve" : "reject"}_${kind ?? "unknown"}`,
        target: targetId ?? "",
        created_at: now(),
      });
      return { status: 200, body: { kind, id: targetId, decision } };
    }

    default:
      return { status: 404, body: { message: `No mock handler for ${clean}.` } };
  }
}

