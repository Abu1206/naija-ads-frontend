// Advertiser-overview helpers: pure, server-safe derivations from
// backend-owned rows. Money amounts are never derived here — spend and
// remaining arrive as kobo ints and are only displayed (AGENTS.md §6.1).
// Everything below works on counts, ratios and status ladders.

import { budgetUtilization, formatDelta, type Delta } from "./format";
import type { Campaign } from "./types";

export interface SeriesPoint {
  period: string;
  impressions: number;
  clicks: number;
}

export interface WindowTotals {
  impressions: number;
  clicks: number;
}

/** Sum of the windowed series — counts only; the backend owns every number. */
export function windowTotals(series: SeriesPoint[]): WindowTotals {
  return {
    impressions: series.reduce((sum, p) => sum + p.impressions, 0),
    clicks: series.reduce((sum, p) => sum + p.clicks, 0),
  };
}

export interface WindowDeltas {
  impressions: Delta | null;
  clicks: Delta | null;
  ctr: Delta | null;
}

/**
 * Window-vs-window comparison: the selected window against the equal-length
 * window before it (`previous_window` from the API). Counts and CTR only —
 * spend has no previous-window series, so the budget card shows utilization
 * context instead. Null when there is no baseline, so callers can drop the
 * delta rather than render a misleading 0%.
 */
export function windowDeltas(
  series: SeriesPoint[],
  previous: { impressions: number; clicks: number } | null,
): WindowDeltas {
  const empty: WindowDeltas = { impressions: null, clicks: null, ctr: null };
  if (!previous || series.length === 0) return empty;
  const current = windowTotals(series);
  if (previous.impressions <= 0 || current.impressions <= 0) return empty;
  return {
    impressions: formatDelta(current.impressions, previous.impressions),
    clicks: formatDelta(current.clicks, previous.clicks),
    ctr: formatDelta(current.clicks / current.impressions, previous.clicks / previous.impressions),
  };
}

export interface AttentionFlag {
  campaign: Campaign;
  reason: string;
}

function ctrOf(c: Campaign): number {
  return c.impressions > 0 ? c.clicks / c.impressions : 0;
}

/** Share of budget used at which the wallet counts as low — the overview
 * banner, the wallet flag and the table signal all read this one source. */
export const LOW_BALANCE_THRESHOLD = 0.85;
/** CTR below this (with enough impressions to mean it) reads as weak creative. */
export const WEAK_CTR_THRESHOLD = 0.01;
export const CTR_SIGNAL_MIN_IMPRESSIONS = 10000;

/**
 * Campaigns that need an advertiser's eye, most urgent first: rejected,
 * in-review and draft items before paused ones, then live campaigns with
 * weak CTR or a nearly-spent budget. The budget share is the same
 * display-only fraction as the overview bar — it flags, it never settles.
 */
export function attentionFlags(campaigns: Campaign[]): AttentionFlag[] {
  const flags: AttentionFlag[] = [];
  for (const campaign of campaigns) {
    if (campaign.status === "rejected") {
      flags.push({ campaign, reason: "Rejected — fix the flagged creative and resubmit." });
    } else if (campaign.status === "under_review" || campaign.status === "submitted") {
      flags.push({ campaign, reason: "In review — delivery starts once approved and funded." });
    } else if (campaign.status === "draft") {
      flags.push({ campaign, reason: "Draft — submit for review to start delivery." });
    } else if (campaign.status === "paused") {
      flags.push({ campaign, reason: "Paused — resume or archive to free the budget." });
    } else if (campaign.status === "active") {
      const share = budgetUtilization(campaign.spend_kobo, campaign.remaining_budget_kobo);
      if (share !== null && share >= LOW_BALANCE_THRESHOLD) {
        flags.push({ campaign, reason: "Budget 85%+ used — top up to keep delivering." });
      } else if (campaign.impressions >= CTR_SIGNAL_MIN_IMPRESSIONS && ctrOf(campaign) < WEAK_CTR_THRESHOLD) {
        flags.push({ campaign, reason: "CTR under 1% — refresh the creative." });
      }
    }
  }
  const rank = (f: AttentionFlag): number => {
    switch (f.campaign.status) {
      case "rejected":
        return 0;
      case "under_review":
      case "submitted":
        return 1;
      case "draft":
        return 2;
      case "paused":
        return 3;
      default:
        return 4;
    }
  };
  return flags.sort((a, b) => rank(a) - rank(b)).slice(0, 4);
}

export interface CampaignSignal {
  /** Short column label — "Low budget" or "Weak CTR". */
  label: string;
}

/**
 * Row-level health for the performance table: the same thresholds as
 * attentionFlags, compressed to a column label. Active campaigns only — other
 * statuses already speak through the status badge. Budget pressure first: a
 * nearly-spent campaign needs money before creative advice.
 */
export function campaignSignal(campaign: Campaign): CampaignSignal | null {
  if (campaign.status !== "active") return null;
  const share = budgetUtilization(campaign.spend_kobo, campaign.remaining_budget_kobo);
  if (share !== null && share >= LOW_BALANCE_THRESHOLD) return { label: "Low budget" };
  if (campaign.impressions >= CTR_SIGNAL_MIN_IMPRESSIONS && ctrOf(campaign) < WEAK_CTR_THRESHOLD) {
    return { label: "Weak CTR" };
  }
  return null;
}
