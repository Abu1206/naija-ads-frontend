# Dashboard build report — what was built and how it talks to the Go backend

Written 2026-10-08 on branch `fix/guard-dashboard-routes-and-mirror-contract`.
Source of truth: `Naija_Ads_MVP_Product_and_Technical_Specification.pdf` (the § numbers below are that
document) plus `AGENTS.md`.

## 1. What exists now

Every dashboard route in AGENTS.md §3 is a real page with live data fetching, loading / error /
empty states, and navigation between them. Nothing renders mock data.

**Public site** (no session required)

| Route | What it shows |
| --- | --- |
| `/` | Landing + role router. Lives in `app/(marketing)/page.tsx` so it inherits the product nav and legal footer; a signed-in visitor is redirected to their dashboard instead |
| `/advertisers`, `/developers`, `/pricing` | Demand-side and supply-side pages, CPM model |
| `/docs/*`, `/tutorials/*` | Developer integration docs and first-campaign / first-placement walkthroughs |
| `/login` | `LoginForm` → `POST /api/v1/auth/login`, then `/` (which routes to the dashboard) |
| `/signup?role=business\|developer` | Role tabs + the profile fields spec §6.1/§9.1 name, posted to the matching create endpoint |

**Business** (`/business`, role `business`)

| Route | What it shows |
| --- | --- |
| `/business` | Overview: impressions, clicks, CTR, spend + remaining budget, delivery chart, top campaigns |
| `/business/campaigns` | Campaign list with format, budgets, spend, remaining budget, status |
| `/business/campaigns/new` | Campaign creation form (spec §10 fields) |
| `/business/creatives` | Creative upload + list of uploaded creatives with review status |
| `/business/analytics` | Delivery metrics, per-format breakdown |
| `/business/billing` | Wallet balance, funding via Bachs checkout, payment history |
| `/business/onboarding` | Business profile (§9.2) + submit for verification (§9.3) |

**Developer** (`/developer`, role `developer`)

| Route | What it shows |
| --- | --- |
| `/developer` | Overview: impressions, fill rate, estimated revenue, eCPM, revenue by format, earnings, payouts |
| `/developer/apps` | Register an app (§6.4) + list with the backend-issued `APP_ID` |
| `/developer/placements` | Create banner/interstitial/rewarded/audio placements per app (§6.5) |
| `/developer/analytics` | Requests, fill rate, eCPM, delivery chart, per-app performance |
| `/developer/earnings` | Earnings ledger with the §17 status ladder |
| `/developer/payouts` | Payout account, payout request, payout history |
| `/developer/onboarding` | Developer profile (§6.2) + verification submit (§6.3) |

**Admin** (`/admin`, role `admin`)

| Route | What it shows |
| --- | --- |
| `/admin` | Network overview: demand + supply metrics, entry cards to each queue |
| `/admin/reviews` | Five queues (business, developer, app, campaign, creative) with approve/reject |
| `/admin/payments` | Payments, payout requests with manual approval, spend + earnings totals |
| `/admin/fraud` | Fraud alerts by signal and severity |
| `/admin/audit` | Audit log (read-only) |

Shared pieces: `components/Sidebar.tsx` (active-link nav), `DashboardShell.tsx` (sidebar + page
header + green CTA), `MetricCard.tsx`, `DataTable.tsx`, `StatusBadge.tsx`, `BarChart.tsx`,
`Icon.tsx`, and the client forms: `CampaignForm`, `CreativeUploader`, `FundForm`, `ProfileForm`
(reused for business profile, developer profile, app registration, placement creation, the payout
account and both signup variants), `PayoutRequestForm`, `ReviewDecision`, `LoginForm`.

## 2. Look and feel

White surfaces, gray page background, one accent. `app/globals.css` defines the brand tokens:

```css
@theme {
  --color-brand: #38b000;
  --color-brand-strong: #2e9100;
}
```

Green is restricted to **buttons, icons and chart series** — never a background, never a page
canvas. Where green marks a status it is used at 10% opacity with the darker `brand-strong` text
(`StatusBadge`), and every badge pairs colour with text so meaning never depends on colour alone.
Charts use brand green for the primary series and gray for the comparison series.

## 3. How it connects to the backend

All paths live in **`lib/endpoints.ts`** — one file to edit when the Go server's naming settles.
All HTTP goes through **`lib/api.ts`**, which builds the URL from `NEXT_PUBLIC_API_BASE_URL`
(default `http://localhost:8080`), sends `credentials: "include"` so the httpOnly session cookie
travels, and maps `401` → re-login and `422` → per-field errors.

### Reads (server components, via `load<T>()` which never throws)

| Page | Request | Spec status |
| --- | --- | --- |
| Business overview / analytics / billing | `GET /api/v1/analytics?scope=business` | documented §23 |
| Business campaigns | `GET /api/v1/campaigns` | documented |
| Business creatives, creative picker on the campaign form | `GET /api/v1/creatives` | documented |
| Billing history | `GET /api/v1/payments` | documented |
| Developer overview / analytics / earnings | `GET /api/v1/analytics?scope=developer` | documented |
| Developer apps, placements | `GET /api/v1/apps`, `GET /api/v1/placements` | documented |
| Earnings ledger | `GET /api/v1/earnings` | documented |
| Payout history | `GET /api/v1/payouts` | documented |
| Admin overview + payments metrics | both analytics scopes | documented |
| Admin review queues | `GET /api/v1/admin/{businesses,developers,apps,campaigns,creatives}` | **assumed** inside the documented `/api/v1/admin` family |
| Admin payments / payouts / fraud / audit | `GET /api/v1/admin/{payments,payouts,fraud-alerts,audit-logs}` | **assumed** |

### Writes (client components, via `apiFetch`)

| Action | Request | Spec status |
| --- | --- | --- |
| Log in | `POST /api/v1/auth/login` with `{ email, password }` | documented (AGENTS.md §4) |
| Business profile + verification | `POST /api/v1/businesses` | documented |
| Developer profile + verification | `POST /api/v1/developers` | documented |
| Register app | `POST /api/v1/apps` | documented |
| Create placement | `POST /api/v1/placements` | documented |
| Create campaign (§10 fields, budgets converted ₦→kobo) | `POST /api/v1/campaigns` | documented |
| Fund wallet | `POST /api/v1/payments` → redirect to `checkout_url` | documented |
| Creative upload | `POST /api/v1/creatives/upload-intent` → `PUT` to the presigned R2 URL → `POST /api/v1/creatives` | flow documented in AGENTS.md §4, **path names assumed** |
| Payout account | `POST /api/v1/payouts/account` | **assumed** (entity `developer_payout_accounts` §19) |
| Request payout | `POST /api/v1/payouts` | documented |
| Approve / reject | `POST /api/v1/admin/reviews/decision` with `{ kind, id, decision, reason? }` | **assumed** |

The presigned `PUT` deliberately bypasses `lib/api.ts`: that client forces JSON headers, which
would break an R2 signature.

Two details the auth wiring depends on, both currently assumed: `POST /api/v1/auth/login` is
expected to set the httpOnly session cookie itself (the client then only redirects to `/`, which
routes by role — it never handles a token), and signup posts the same `POST /api/v1/businesses` /
`/developers` that `/business/onboarding` and `/developer/onboarding` use. See §6.

### Guards

`middleware.ts` (edge) protects every `/business/*`, `/developer/*`, `/admin/*` request: no session
cookie → `/login`, wrong role → `/403`. Segment-boundary matching keeps the public `/developers`
marketing page reachable. Each dashboard layout *also* calls `requireRole()` so a page is guarded
even if the matcher is narrowed later. Role parsing lives in `lib/role.ts` because edge runtime
cannot import `next/headers`.

## 4. Invariants held (AGENTS.md §6)

1. **No money math in the client.** Every amount displayed comes from a `*_kobo` field the backend
   computed. The only arithmetic on money is `nairaInputToKobo()` on form *input* (the advertiser
   types naira, the API takes kobo) and the ratio formatters (`formatCTR`, `formatECPM`,
   `formatFillRate`) over backend counts.
2. **No tokens in localStorage.** Session comes from the httpOnly cookie; nothing writes tokens
   client-side.
3. **No privileged secrets.** The apps page renders the public `APP_ID` only — SDK secrets are never
   requested or shown.
4. **Forms validate and surface server errors.** zod or required-field checks client-side, and every
   `422` field error is rendered back next to the submit button. Uploads pre-check type/size and
   still expect server rejection.
5. **Role guards** on every dashboard route (middleware + layout).
6. **No mock data.** With the API down, pages show their error state — that is the state these
   screenshots were taken in.
7. **Accessibility.** Every input has a label, charts carry `figcaption` + `aria-label` summaries,
   status is text-and-colour, alerts use `role="alert"`, loading uses `role="status"`.

## 5. Verification

```
pnpm typecheck   # tsc --noEmit — clean
pnpm lint        # eslint — clean
pnpm test        # vitest — 24 passed (format, api + unreachable-API mapping, role)
```

`pnpm dev` + curl and a real browser pass over all 19 dashboard routes: each renders `200` with its
error state when the API is unreachable, the sidebar highlights the current page, and a
`business` session hitting `/admin/reviews` is redirected to `/403`. All eleven public routes
(`/`, the two role pages, pricing, five docs pages, two tutorials, privacy, terms) render `200`
with the marketing nav and legal footer, and `/login` + `/signup?role=…` render their labelled
forms.

Note: tests need Node ≥ 22 (`package.json` engines). The system `/usr/bin/node` is v20 and jsdom
fails there; run with the nvm Node 24 on `PATH`.

## 6. Open gaps the backend has to close

These are deliberate blanks, not oversights:

1. **Pending vs available earnings (§22)** — §23 exposes no balance aggregate, and summing earnings
   rows in the browser would be client-side money math. Those two tiles read "—".
2. **Admin queue counts / network totals** — the assumed `/api/v1/admin/*` endpoints return lists,
   not totals; showing a page length as a network size would lie.
3. **Assumed paths** — everything marked *assumed* above needs the real names from the Go server.
   Rename in `lib/endpoints.ts` only.
4. **Session cookie name/format** — `naija_ads_session` holding a plain role string is a stand-in
   until real auth lands; the backend must issue an httpOnly cookie and the guard must verify the
   token, not read a role label.
5. **CSRF** — state-changing `POST`s ride a cookie with no CSRF token yet. Needs a decision
   (same-site cookie or token) before auth ships.
6. **`audio` format — needs one line of confirmation from the Go server.** `AdType` now carries
   four values (`lib/types.ts` exports `AD_TYPES`, the single list every format picker and
   per-format breakdown reads). This follows AGENTS.md §3 and `/docs/formats`, which spell out
   audio placement rules; the earlier three-value mirror made a documented format uncreatable. If
   the backend ships three, delete `"audio"` in that one place — do not re-fork the list.
7. **Docs pages** — `/docs` shows ad-request/event paths without the `/api` prefix the spec uses.
8. **Login response shape** — the client assumes the backend sets the session cookie on
   `POST /api/v1/auth/login` and ignores the response body. If login returns a token instead, this
   app has no place to put it (AGENTS.md §6 forbids localStorage) and the endpoint must move to a
   route handler that sets the cookie server-side.
9. **Signup vs onboarding overlap** — both post to `/api/v1/businesses` and `/api/v1/developers`.
   If the create-profile call is what actually opens the account, the onboarding pages are
   re-submitting an existing profile; if a separate auth endpoint creates credentials, signup is
   missing that call. Needs the real order from the backend.
10. **`middleware.ts` reads a plain role string** from `naija_ads_session` (see gap 4), so
    `/login`'s redirect to `/` only lands on a dashboard once the backend issues a real session.
