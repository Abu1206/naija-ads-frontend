// Advertiser-overview helpers: pure, server-safe derivations from
// backend-owned rows. Money amounts are never derived here — spend and
// remaining arrive as kobo ints and are only displayed (AGENTS.md §6.1).
// Everything below works on counts, ratios and status ladders.

import { budgetUtilization, formatDelta, type Delta } from "./format";
import type { Campaign } from "./types";

export type SeriesGrain = "daily" | "monthly";

export interface SeriesPoint {
  period: string;
  impressions: number;
  clicks: number;
}

/** Daily periods arrive as "2026-10-03"; monthly as "2026-10". */
export function detectGrain(periods: string[]): SeriesGrain {
  return periods.some((p) => /^\d{4}-\d{2}-\d{2}/.test(p)) ? "daily" : "monthly";
}

export interface PeriodDeltas {
  impressions: Delta | null;
  clicks: Delta | null;
  ctr: Delta | null;
  /** Label of the previous period ("Sep"), for "vs Sep" captions. */
  prevLabel: string | null;
}

/**
 * Month-over-month (or day-over-day) comparison from the backend series'
 * last two points. Counts and CTR only — spend has no previous-period
 * series, so the spend card shows budget context instead of a delta.
 */
export function seriesDeltas(
  series: SeriesPoint[],
  label: (period: string) => string,
): PeriodDeltas {
  const empty: PeriodDeltas = { impressions: null, clicks: null, ctr: null, prevLabel: null };
  if (series.length < 2) return empty;
  const prev = series[series.length - 2]!;
  const last = series[series.length - 1]!;
  const prevCtr = prev.impressions > 0 ? prev.clicks / prev.impressions : 0;
  const lastCtr = last.impressions > 0 ? last.clicks / last.impressions : 0;
  return {
    impressions: formatDelta(last.impressions, prev.impressions),
    clicks: formatDelta(last.clicks, prev.clicks),
    ctr: prev.impressions > 0 && last.impressions > 0 ? formatDelta(lastCtr, prevCtr) : null,
    prevLabel: label(prev.period),
  };
}

export interface AttentionFlag {
  campaign: Campaign;
  reason: string;
}

function ctrOf(c: Campaign): number {
  return c.impressions > 0 ? c.clicks / c.impressions : 0;
}

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
      if (share !== null && share >= 0.85) {
        flags.push({ campaign, reason: "Budget 85%+ used — top up to keep delivering." });
      } else if (campaign.impressions >= 10000 && ctrOf(campaign) < 0.01) {
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
