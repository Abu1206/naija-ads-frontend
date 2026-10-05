# naija-ads-frontend

Next.js dashboards for **Naija Ads** — business (demand), developer (inventory), admin (review + trust).

Full build instructions: [`AGENTS.md`](./AGENTS.md).
Team workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md) + [`docs/COLLABORATION.md`](./docs/COLLABORATION.md).
Product spec lives in the backend repo: `Naija_Ads_MVP_Product_and_Technical_Specification.docx`.

## Stack

Next.js 14 App Router + TypeScript strict + Tailwind. Vitest + Playwright. Backend API via typed `lib/api.ts`.

```
app/(business)  → campaigns, creatives, billing (Bachs funding)
app/(developer) → apps, placements, earnings, payouts
app/(admin)     → reviews, payments, fraud, audit
```

Backend contract: `NEXT_PUBLIC_API_BASE_URL` + `/api/v1/...` (see `AGENTS.md §4`). Sign in uses Google Identity Services and the backend's HttpOnly session cookie.

## Status

🚧 **Docs + instructions only (pre-Phase 1).** No code scaffolded yet on purpose.
Scaffold `app/`, `components/`, `lib/`, `e2e/` exactly as `AGENTS.md §3` when Phase 1 starts.

## Quickstart (once scaffolded)

```bash
cp .env.example .env.local
npm install
npm run dev
npm run typecheck && npm run lint && npm run test
```

## Contributing

Read `AGENTS.md` (contract + invariants), then `CONTRIBUTING.md` (branches, commits, PRs with screenshots).
Auth, billing, and upload paths need extra review — see `docs/COLLABORATION.md` + `CODEOWNERS`.
