# AGENTS.md — naija-ads-frontend

> Instructions for AI agents AND human contributors building the Naija Ads dashboards.
> The MVP spec (`Naija_Ads_MVP_Product_and_Technical_Specification.docx`, kept in the backend repo) is the source of truth.
> This file tells you HOW to build the frontend. Do not drift without an ADR.

## 1. What this app is

Next.js + TypeScript dashboards for the **same two-sided network** the Go backend serves:
- **Business dashboard** — campaigns, creatives, funding (Bachs), spend + performance.
- **Developer dashboard** — apps, placements, SDK keys/docs, earnings + payouts.
- **Admin dashboard** — verification queues, campaign/creative review, payments, fraud alerts, audit logs.

This repo renders UI + talks to the backend API. It NEVER decides money, auction winners, rewards, or targeting — the Go server does.

## 2. Tech stack (do not change without RFC)

- **Next.js 16 App Router + TypeScript strict** (`strict: true`, no `any` without justification). React 19. Node >= 22. See ADR 0002 (upgraded from Next.js 14, which is EOL).
- **Tailwind CSS v4** for styling (CSS-first `@import "tailwindcss"`, PostCSS via `@tailwindcss/postcss`). No new UI kit without RFC (shadcn acceptable if team agrees — record ADR).
- Data: `fetch` via a typed `lib/api.ts` client; server components for reads, client components only for forms/interactive widgets.
- Auth: backend-issued session/JWT in **httpOnly cookie** (never localStorage for tokens). Role-based route guards: `/business/*`, `/developer/*`, `/admin/*`.
- Forms: controlled + schema validation (zod recommended). Uploads: file type/size/dimension pre-check client-side, real validation server-side.
- Tests: **Vitest** (unit) + **Playwright** (critical flows). Lint: ESLint + Prettier.

## 3. Project structure (Next.js 16 App Router)

```
naija-ads-frontend/
├── app/
│   ├── layout.tsx               # root layout, public nav
│   ├── page.tsx                 # landing + role router
│   ├── 403/page.tsx             # wrong-role landing (lib/auth.ts redirects here)
│   ├── not-found.tsx, sitemap.ts, robots.ts
│   ├── (marketing)/layout.tsx   # product nav + legal footer
│   │   ├── advertisers/page.tsx # public demand-side page (/advertisers)
│   │   ├── developers/page.tsx  # public supply-side page (/developers)
│   │   ├── pricing/page.tsx     # CPM model + format floor tiers
│   │   ├── docs/                # developer docs: overview, getting-started,
│   │   │                        #   web-sdk, formats, test-mode
│   │   ├── tutorials/           # first-campaign, first-placement
│   │   ├── privacy/page.tsx     # NDPR minimization + publisher duties
│   │   └── terms/page.tsx       # marketplace terms
│   ├── (auth)/login/page.tsx    # login entry (Google wiring lands with auth build)
│   ├── (auth)/signup/page.tsx   # role picker → Continue with Google
│   ├── (business)/layout.tsx + /business/
│   │   ├── campaigns/page.tsx + campaigns/new/page.tsx
│   │   ├── creatives/page.tsx   # upload (R2 via backend presigned URL)
│   │   ├── analytics/page.tsx   # impressions/clicks/CTR/spend breakdowns
│   │   ├── billing/page.tsx     # fund via Bachs checkout, ledger view
│   │   └── onboarding/page.tsx  # business profile + verification submit
│   ├── (developer)/layout.tsx + /developer/
│   │   ├── apps/page.tsx        # register app → APP_ID + SDK creds display
│   │   ├── placements/page.tsx  # per-app banner/interstitial/rewarded/audio
│   │   ├── analytics/page.tsx   # per-app fill rate, eCPM, revenue split
│   │   ├── earnings/page.tsx
│   │   ├── payouts/page.tsx
│   │   └── onboarding/page.tsx  # developer profile + verification submit
│   └── (admin)/layout.tsx + /admin/
│       ├── page.tsx             # network overview + queue entry points
│       ├── reviews/page.tsx     # business/dev/app/campaign/creative queues
│       ├── payments/page.tsx
│       ├── fraud/page.tsx
│       └── audit/page.tsx
├── components/                  # shared: tables, charts, status badges, upload dropzone
├── lib/
│   ├── api.ts                   # typed backend client (ONE place building URLs/headers)
│   ├── auth.ts                  # session helpers, role guards
│   ├── types.ts                 # mirrors backend contracts (campaign, creative, ledger…)
│   └── format.ts                # kobo→₦, dates, CTR/eCPM/fill-rate formatters
├── e2e/                         # Playwright specs (login, campaign create, funding mock)
└── docs/adr/
```

Route groups `(marketing)` etc. keep URLs clean (`/business/campaigns`) while sharing layouts.
Public marketing + docs + tutorials are content pages (no auth); every dashboard page keeps its
role guard. Structural shells only — backend wiring lands per the roadmap hooks in §10.

## 4. Backend contract (mirror — never redefine)

Base URL from env `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8080`). All paths versioned:

```
POST /api/v1/auth/login, /api/v1/developers, /api/v1/businesses
GET/POST /api/v1/apps, /api/v1/placements
GET/POST /api/v1/campaigns, /api/v1/creatives
POST /api/v1/payments (create Bachs checkout) — webhook handled server-side only
GET /api/v1/earnings, /api/v1/payouts
GET /api/v1/analytics?scope=business|developer&...
GET /api/v1/admin/...
```

Rules:
- Field names match backend exactly (`app_id`, `placement_id`, `ad_type`, `event_id`…). Renames need cross-repo RFC.
- Money displayed from backend-computed values only, formatted from **kobo int** (`₦1,000.00` from `100000`). Never compute spend/revenue client-side.
- Creative uploads: request presigned R2 URL from backend → PUT file → confirm metadata. Never hardcode bucket URLs.
- Bachs funding: redirect to backend-created checkout URL; success screen waits for **webhook-confirmed** ledger credit (poll `GET /payments/:id`), never trust the redirect query param alone.

## 5. Dashboards — required metrics (spec §22)

- Business: impressions, clicks, **CTR**, spend, remaining budget, campaign status, format breakdown.
- Developer: app, impressions, **fill rate**, estimated revenue (total + banner/interstitial/rewarded split), pending vs available earnings, payout status.
- Admin: businesses, developers, apps, active campaigns, campaign + creative review queues, payments, advertiser spend, developer earnings, payouts, impressions, clicks, fill rate, **eCPM**, CTR, fraud alerts, audit logs.
- Empty/loading/error/no-fill states for every metric card and table. Numbers get `format.ts` formatters + accessible labels.

## 6. CRITICAL invariants (violations = reject PR)

1. No money math in the client. Display only.
2. No tokens in localStorage. httpOnly cookies + server-guarded routes.
3. No privileged secrets (`APP secret`, R2 keys, Bachs keys) in client bundle — `NEXT_PUBLIC_*` is public by definition.
4. Every form validates + shows server errors; uploads enforce type/size client-side AND expect server rejection.
5. Role guards on every dashboard route + API call (business ≠ developer ≠ admin).
6. No mock data in merged PRs outside `*.stories.*` / e2e fixtures clearly labeled.
7. Accessibility: labels on inputs, keyboard-reachable actions, contrast-safe status colors, no color-only meaning.

## 7. TESTING — required

| Area | What to test |
| ---- | ------------ |
| `lib/format.ts` | kobo→₦, CTR/eCPM/fill-rate math, edge (0 impressions → "—") |
| `lib/api.ts` | URL building, auth headers, error mapping (401 → login, 422 → field errors) |
| Components | status badges, tables (empty/loading/error), upload validation messages |
| Routes | role guard redirects (unauth → login, wrong role → 403) |
| e2e (Playwright) | login → create campaign → upload creative → fund (mocked checkout) → admin approve appears |

Conventions: colocated `*.test.ts(x)` with Vitest; e2e in `e2e/`. Package manager is **pnpm** (`packageManager` pinned in `package.json`). CI runs `tsc --noEmit`, `eslint`, `vitest run`, `playwright` (smoke on staging). Bug fixes ship a failing-first regression test.

```bash
pnpm typecheck   # tsc --noEmit (must pass)
pnpm lint        # eslint (must pass)
pnpm test        # vitest run (must pass)
pnpm test:e2e    # playwright (critical flows)
```

## 8. Config / env

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# server-only (no NEXT_PUBLIC_ prefix): session secrets, revalidation tokens — never commit real values
```
`.env.example` documents keys; `.env.local` gitignored. Staging/prod URLs set in hosting provider, not code.

## 9. What NOT to build

No ad-server logic, no auction simulation, no client-side reward granting, no custom chart lib (use one agreed lib), no extra dashboards/roles, no dark-mode/theme system beyond Tailwind defaults unless RFC'd. Reject scope creep.

## 10. Roadmap hooks

Frontend tracks backend Phases 1–7: auth shells (P1) → dev apps/placements (P2) → business campaigns/creatives (P3) → analytics views (P4) → billing/funding (P5) → earnings/payouts (P6) → hardening/a11y/perf (P7). MVP done when every spec §29 checkbox is clickable end-to-end, then controlled pilot with a few vetted NG devs + businesses.

## 11. Working agreements (details in CONTRIBUTING.md + docs/COLLABORATION.md)

Branches `feat/<issue>-<slug>`, Conventional Commits, small PRs (<400 lines) with screenshots for UI + test evidence, 1 approval (2 for auth/billing/upload paths), CI green, squash-merge.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
