// Fixture dataset for the disconnected frontend.
//
// The Go backend is not deployed, so every screen would render its error state.
// These fixtures are typed against `lib/types.ts` — the same contract mirror the
// real client uses — so swapping back to a live API needs no page or component
// change. See docs/adr/0003-mock-data-layer.md for why this is a deliberate,
// flagged exception to AGENTS.md §6.6.
//
// Nothing here computes money: every `*_kobo` value is written as a literal, the
// way the backend would return it. Formatters stay display-only.

import type {
  AnalyticsSummary,
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

/** The signed-in business in the fixture. Mirrors what the backend would scope to. */
export const CURRENT_BUSINESS_ID = "biz_acme_foods";
/** The signed-in developer in the fixture. */
export const CURRENT_DEVELOPER_ID = "dev_ada_okonkwo";

const iso = (y: number, m: number, d: number) =>
  `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T09:00:00.000Z`;

// ---------------------------------------------------------------------------
// Business side
// ---------------------------------------------------------------------------

export const businesses: Business[] = [
  {
    id: CURRENT_BUSINESS_ID,
    name: "Acme Foods Ltd",
    industry: "Food & beverage",
    website: "https://acme.ng",
    location: "Lagos, Nigeria",
    description: "Packaged snacks and drinks distributed across southwest Nigeria.",
    verification_status: "approved",
    created_at: iso(2026, 3, 14),
  },
  {
    id: "biz_lumen_bank",
    name: "Lumen Microfinance Bank",
    industry: "Financial services",
    website: "https://lumenbank.ng",
    location: "Abuja, Nigeria",
    description: "Agent banking and micro-loans for traders.",
    verification_status: "pending",
    created_at: iso(2026, 5, 2),
  },
  {
    id: "biz_zinga_telco",
    name: "Zinga Mobile",
    industry: "Telecommunications",
    website: "https://zinga.ng",
    location: "Port Harcourt, Nigeria",
    description: "Prepaid data bundles for young urban users.",
    verification_status: "approved",
    created_at: iso(2026, 1, 9),
  },
  {
    id: "biz_hauwa_fits",
    name: "Hauwa Fits",
    industry: "Fashion",
    website: "",
    location: "Kano, Nigeria",
    description: "Ready-to-wear modest fashion.",
    verification_status: "rejected",
    created_at: iso(2026, 6, 21),
  },
];

export const campaigns: Campaign[] = [
  {
    id: "cmp_omo_launch",
    business_id: CURRENT_BUSINESS_ID,
    name: "Indomie Relaunch — Banner",
    objective: "impressions",
    status: "active",
    ad_type: "banner",
    total_budget_kobo: 500000000,
    daily_budget_kobo: 1500000,
    spend_kobo: 214500000,
    remaining_budget_kobo: 285500000,
    impressions: 1842000,
    clicks: 46100,
    destination_url: "https://acme.ng/indomie",
    created_at: iso(2026, 4, 2),
  },
  {
    id: "cmp_omo_rewarded",
    business_id: CURRENT_BUSINESS_ID,
    name: "Indomie Rewarded Video",
    objective: "clicks",
    status: "active",
    ad_type: "rewarded",
    total_budget_kobo: 750000000,
    daily_budget_kobo: 2500000,
    spend_kobo: 402300000,
    remaining_budget_kobo: 347700000,
    impressions: 620400,
    clicks: 41800,
    destination_url: "https://acme.ng/rewarded",
    created_at: iso(2026, 4, 18),
  },
  {
    id: "cmp_chivita_audio",
    business_id: CURRENT_BUSINESS_ID,
    name: "Chivita 100% — Audio Spot",
    objective: "impressions",
    status: "active",
    ad_type: "audio",
    total_budget_kobo: 300000000,
    daily_budget_kobo: 900000,
    spend_kobo: 128700000,
    remaining_budget_kobo: 171300000,
    impressions: 412000,
    clicks: 3100,
    destination_url: "https://acme.ng/chivita",
    created_at: iso(2026, 5, 6),
  },
  {
    id: "cmp_peak_interstitial",
    business_id: CURRENT_BUSINESS_ID,
    name: "Peak Milk Interstitial",
    objective: "impressions",
    status: "paused",
    ad_type: "interstitial",
    total_budget_kobo: 400000000,
    daily_budget_kobo: 1200000,
    spend_kobo: 98000000,
    remaining_budget_kobo: 302000000,
    impressions: 388000,
    clicks: 12400,
    destination_url: "https://acme.ng/peak",
    created_at: iso(2026, 5, 22),
  },
  {
    id: "cmp_cutlery_draft",
    business_id: CURRENT_BUSINESS_ID,
    name: "Cutlery Set — Q4 Push",
    objective: "clicks",
    status: "draft",
    ad_type: "banner",
    total_budget_kobo: 150000000,
    daily_budget_kobo: 500000,
    spend_kobo: 0,
    remaining_budget_kobo: 150000000,
    impressions: 0,
    clicks: 0,
    destination_url: "https://acme.ng/cutlery",
    created_at: iso(2026, 9, 1),
  },
  {
    id: "cmp_xmas_review",
    business_id: CURRENT_BUSINESS_ID,
    name: "Christmas Hamper — Under Review",
    objective: "impressions",
    status: "under_review",
    ad_type: "interstitial",
    total_budget_kobo: 600000000,
    daily_budget_kobo: 2000000,
    spend_kobo: 0,
    remaining_budget_kobo: 600000000,
    impressions: 0,
    clicks: 0,
    destination_url: "https://acme.ng/hamper",
    created_at: iso(2026, 8, 12),
  },
];

export const creatives: Creative[] = [
  {
    id: "crv_omo_banner_1",
    campaign_id: "cmp_omo_launch",
    ad_type: "banner",
    status: "approved",
    file_url: "https://cdn.naijaads.ng/creatives/omo-banner-320x50.png",
    width: 320,
    height: 50,
    size_bytes: 48210,
    created_at: iso(2026, 4, 2),
  },
  {
    id: "crv_omo_banner_2",
    campaign_id: "cmp_omo_launch",
    ad_type: "banner",
    status: "approved",
    file_url: "https://cdn.naijaads.ng/creatives/omo-banner-728x90.png",
    width: 728,
    height: 90,
    size_bytes: 96400,
    created_at: iso(2026, 4, 3),
  },
  {
    id: "crv_omo_rewarded_1",
    campaign_id: "cmp_omo_rewarded",
    ad_type: "rewarded",
    status: "approved",
    file_url: "https://cdn.naijaads.ng/creatives/omo-rewarded-1080x1920.mp4",
    width: 1080,
    height: 1920,
    size_bytes: 8421000,
    created_at: iso(2026, 4, 18),
  },
  {
    id: "crv_chivita_audio_1",
    campaign_id: "cmp_chivita_audio",
    ad_type: "audio",
    status: "approved",
    file_url: "https://cdn.naijaads.ng/creatives/chivita-audio-30s.m4a",
    width: 0,
    height: 0,
    size_bytes: 512000,
    created_at: iso(2026, 5, 6),
  },
  {
    id: "crv_peak_inter_1",
    campaign_id: "cmp_peak_interstitial",
    ad_type: "interstitial",
    status: "approved",
    file_url: "https://cdn.naijaads.ng/creatives/peak-inter-1080x1920.png",
    width: 1080,
    height: 1920,
    size_bytes: 684300,
    created_at: iso(2026, 5, 22),
  },
  {
    id: "crv_xmas_hamper_1",
    campaign_id: "cmp_xmas_review",
    ad_type: "interstitial",
    status: "under_review",
    file_url: "https://cdn.naijaads.ng/creatives/hamper-1080x1920.png",
    width: 1080,
    height: 1920,
    size_bytes: 712000,
    created_at: iso(2026, 8, 12),
  },
  {
    id: "crv_cutlery_1",
    campaign_id: "cmp_cutlery_draft",
    ad_type: "banner",
    status: "draft",
    file_url: "https://cdn.naijaads.ng/creatives/cutlery-320x50.png",
    width: 320,
    height: 50,
    size_bytes: 51300,
    created_at: iso(2026, 9, 1),
  },
];

export const payments: Payment[] = [
  {
    id: "pay_001",
    business_id: CURRENT_BUSINESS_ID,
    amount_kobo: 250000000,
    status: "confirmed",
    checkout_url: "https://checkout.bachs.ng/pay/pay_001",
    reference: "BACHS-8F2K19",
    created_at: iso(2026, 9, 28),
  },
  {
    id: "pay_002",
    business_id: CURRENT_BUSINESS_ID,
    amount_kobo: 500000000,
    status: "confirmed",
    checkout_url: "https://checkout.bachs.ng/pay/pay_002",
    reference: "BACHS-2LM4Q7",
    created_at: iso(2026, 8, 30),
  },
  {
    id: "pay_003",
    business_id: CURRENT_BUSINESS_ID,
    amount_kobo: 150000000,
    status: "pending",
    checkout_url: "https://checkout.bachs.ng/pay/pay_003",
    reference: "BACHS-9XD3P1",
    created_at: iso(2026, 10, 2),
  },
  {
    id: "pay_004",
    business_id: CURRENT_BUSINESS_ID,
    amount_kobo: 75000000,
    status: "failed",
    checkout_url: "https://checkout.bachs.ng/pay/pay_004",
    reference: "BACHS-4RT8V0",
    created_at: iso(2026, 7, 11),
  },
];

export const ledger: LedgerEntry[] = [
  { id: "led_01", account_id: "acct_acme", amount_kobo: 250000000, direction: "credit", kind: "payment", created_at: iso(2026, 9, 28) },
  { id: "led_02", account_id: "acct_acme", amount_kobo: 42100000, direction: "debit", kind: "spend", created_at: iso(2026, 9, 30) },
  { id: "led_03", account_id: "acct_acme", amount_kobo: 500000000, direction: "credit", kind: "payment", created_at: iso(2026, 8, 30) },
  { id: "led_04", account_id: "acct_acme", amount_kobo: 68400000, direction: "debit", kind: "spend", created_at: iso(2026, 8, 31) },
];

// ---------------------------------------------------------------------------
// Developer side
// ---------------------------------------------------------------------------

export const developers: Developer[] = [
  {
    id: CURRENT_DEVELOPER_ID,
    display_name: "Ada Okonkwo",
    profile_type: "individual",
    studio_name: "",
    website: "https://adaokonkwo.dev",
    country_code: "NG",
    verification_status: "approved",
    created_at: iso(2026, 2, 3),
  },
  {
    id: "dev_lagos_studio",
    display_name: "Tunde Bello",
    profile_type: "studio",
    studio_name: "Lagos Game Studio",
    website: "https://lagosgamestudio.ng",
    country_code: "NG",
    verification_status: "pending",
    created_at: iso(2026, 4, 17),
  },
  {
    id: "dev_kano_labs",
    display_name: "Fatima Yusuf",
    profile_type: "individual",
    studio_name: "",
    website: "",
    country_code: "NG",
    verification_status: "approved",
    created_at: iso(2026, 6, 5),
  },
];

export const apps: App[] = [
  {
    app_id: "app_ludo_naija",
    developer_id: CURRENT_DEVELOPER_ID,
    name: "Ludo Naija",
    platform: "android",
    category: "games",
    package_name: "ng.adaokonkwo.ludonaija",
    age_rating: "everyone",
    status: "approved",
    created_at: iso(2026, 2, 10),
  },
  {
    app_id: "app_naija_trivia",
    developer_id: CURRENT_DEVELOPER_ID,
    name: "Naija Trivia",
    platform: "android",
    category: "trivia",
    package_name: "ng.adaokonkwo.trivia",
    age_rating: "teen",
    status: "approved",
    created_at: iso(2026, 3, 22),
  },
  {
    app_id: "app_ride_hail",
    developer_id: CURRENT_DEVELOPER_ID,
    name: "RideHail NG",
    platform: "ios",
    category: "travel",
    package_name: "ng.adaokonkwo.ridehail",
    age_rating: "everyone",
    status: "pending",
    created_at: iso(2026, 9, 14),
  },
];

export const placements: Placement[] = [
  { placement_id: "plc_ludo_banner", app_id: "app_ludo_naija", name: "Home banner", ad_type: "banner" },
  { placement_id: "plc_ludo_inter", app_id: "app_ludo_naija", name: "Between-rounds interstitial", ad_type: "interstitial" },
  { placement_id: "plc_ludo_reward", app_id: "app_ludo_naija", name: "Extra coins rewarded", ad_type: "rewarded" },
  { placement_id: "plc_trivia_banner", app_id: "app_naija_trivia", name: "Quiz list banner", ad_type: "banner" },
  { placement_id: "plc_trivia_audio", app_id: "app_naija_trivia", name: "Between-quiz audio", ad_type: "audio" },
];

export const earnings: DeveloperEarning[] = [
  { id: "earn_01", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_ludo_naija", ad_type: "rewarded", impressions: 248000, revenue_kobo: 41230000, status: "paid", period: "2026-08" },
  { id: "earn_02", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_ludo_naija", ad_type: "interstitial", impressions: 396000, revenue_kobo: 28410000, status: "paid", period: "2026-08" },
  { id: "earn_03", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_naija_trivia", ad_type: "banner", impressions: 812000, revenue_kobo: 9400000, status: "available", period: "2026-09" },
  { id: "earn_04", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_naija_trivia", ad_type: "audio", impressions: 128000, revenue_kobo: 3800000, status: "validated", period: "2026-09" },
  { id: "earn_05", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_ludo_naija", ad_type: "rewarded", impressions: 74000, revenue_kobo: 12750000, status: "pending", period: "2026-10" },
  { id: "earn_06", developer_id: CURRENT_DEVELOPER_ID, app_id: "app_ludo_naija", ad_type: "banner", impressions: 421000, revenue_kobo: 5200000, status: "validated", period: "2026-10" },
];

export const payouts: Payout[] = [
  { id: "po_01", developer_id: CURRENT_DEVELOPER_ID, amount_kobo: 69640000, status: "paid", requested_at: iso(2026, 9, 2), paid_at: iso(2026, 9, 6) },
  { id: "po_02", developer_id: CURRENT_DEVELOPER_ID, amount_kobo: 42800000, status: "processing", requested_at: iso(2026, 10, 5), paid_at: null },
  { id: "po_03", developer_id: CURRENT_DEVELOPER_ID, amount_kobo: 15000000, status: "pending_review", requested_at: iso(2026, 10, 7), paid_at: null },
  { id: "po_04", developer_id: CURRENT_DEVELOPER_ID, amount_kobo: 5000000, status: "rejected", requested_at: iso(2026, 8, 4), paid_at: null },
];

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const fraudAlerts: FraudAlert[] = [
  { id: "fr_01", kind: "click_rate", severity: "high", subject: "cmp_omo_launch", detail: "Click rate 41% on one device pool over 6 hours — pattern consistent with incentivised clicking.", created_at: iso(2026, 10, 6) },
  { id: "fr_02", kind: "request_rate", severity: "medium", subject: "plc_ludo_banner", detail: "Ad requests 14x the 7-day baseline after a client update shipped.", created_at: iso(2026, 10, 4) },
  { id: "fr_03", kind: "reward_completion", severity: "high", subject: "plc_ludo_reward", detail: "Reward callbacks completing 3.2 seconds before the video can finish.", created_at: iso(2026, 10, 2) },
  { id: "fr_04", kind: "traffic_spike", severity: "low", subject: "app_naija_trivia", detail: "Impressions doubled over a weekend, attributed to a TikTok trend.", created_at: iso(2026, 9, 27) },
  { id: "fr_05", kind: "click_rate", severity: "medium", subject: "cmp_chivita_audio", detail: "Audio completion below the format floor on a single publisher.", created_at: iso(2026, 9, 19) },
];

export const auditLogs: AuditLog[] = [
  { id: "aud_01", actor: "admin:ngozi@naijaads.ng", action: "approve_business", target: "biz_acme_foods", created_at: iso(2026, 3, 16) },
  { id: "aud_02", actor: "admin:ngozi@naijaads.ng", action: "approve_app", target: "app_ludo_naija", created_at: iso(2026, 2, 12) },
  { id: "aud_03", actor: "system", action: "confirm_payment", target: "pay_001", created_at: iso(2026, 9, 28) },
  { id: "aud_04", actor: "admin:ngozi@naijaads.ng", action: "reject_creative", target: "crv_peak_inter_1", created_at: iso(2026, 5, 23) },
  { id: "aud_05", actor: "admin:emeka@naijaads.ng", action: "approve_payout", target: "po_01", created_at: iso(2026, 9, 6) },
  { id: "aud_06", actor: "admin:emeka@naijaads.ng", action: "flag_fraud", target: "fr_01", created_at: iso(2026, 10, 6) },
];

const businessSeries = [
  { period: "2026-05", impressions: 612000, clicks: 14200 },
  { period: "2026-06", impressions: 748000, clicks: 18100 },
  { period: "2026-07", impressions: 1104000, clicks: 28400 },
  { period: "2026-08", impressions: 1320000, clicks: 34800 },
  { period: "2026-09", impressions: 1680000, clicks: 43200 },
  { period: "2026-10", impressions: 1842000, clicks: 46100 },
];

const developerSeries = [
  { period: "2026-05", impressions: 410000, clicks: 6100 },
  { period: "2026-06", impressions: 528000, clicks: 7900 },
  { period: "2026-07", impressions: 604000, clicks: 9400 },
  { period: "2026-08", impressions: 712000, clicks: 11800 },
  { period: "2026-09", impressions: 898000, clicks: 14200 },
  { period: "2026-10", impressions: 1036000, clicks: 16900 },
];

/**
 * Business (demand) and developer (supply) analytics. The admin overview reads
 * both scopes because spec §23 defines no `scope=admin`.
 */
export const businessAnalytics: AnalyticsSummary = {
  impressions: 1842000,
  clicks: 46100,
  spend_kobo: 87320000,
  remaining_budget_kobo: 1106500000,
  revenue_kobo: 0,
  ad_requests: 0,
  filled: 0,
  by_format: {
    banner: { impressions: 1842000, clicks: 46100, revenue_kobo: 0 },
    interstitial: { impressions: 388000, clicks: 12400, revenue_kobo: 0 },
    rewarded: { impressions: 620400, clicks: 41800, revenue_kobo: 0 },
    audio: { impressions: 412000, clicks: 3100, revenue_kobo: 0 },
  },
  series: businessSeries,
};

export const developerAnalytics: AnalyticsSummary = {
  impressions: 1036000,
  clicks: 16900,
  spend_kobo: 0,
  remaining_budget_kobo: 0,
  revenue_kobo: 96440000,
  ad_requests: 1420000,
  filled: 1036000,
  by_format: {
    banner: { impressions: 1233000, clicks: 14600, revenue_kobo: 14600000 },
    interstitial: { impressions: 396000, clicks: 7900, revenue_kobo: 28410000 },
    rewarded: { impressions: 322000, clicks: 4200, revenue_kobo: 53980000 },
    audio: { impressions: 128000, clicks: 1200, revenue_kobo: 3800000 },
  },
  series: developerSeries,
};
