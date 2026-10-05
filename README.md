# naija-ads-frontend

Next.js dashboards for **Naija Ads** — business (demand), developer (inventory), admin (review + trust).

Full build instructions: [`AGENTS.md`](./AGENTS.md).
Team workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md) + [`docs/COLLABORATION.md`](./docs/COLLABORATION.md).
Product spec lives in the backend repo: `Naija_Ads_MVP_Product_and_Technical_Specification.docx`.

## Stack

Next.js 16 App Router + TypeScript strict + Tailwind v4. Vitest + Playwright. Backend API via typed `lib/api.ts`.

```
app/(business)  → campaigns, creatives, billing (Bachs funding)
app/(developer) → apps, placements, earnings, payouts
app/(admin)     → reviews, payments, fraud, audit
```

Backend contract: `NEXT_PUBLIC_API_BASE_URL` + `/api/v1/...` (see `AGENTS.md §4`).

## Status

🏗️ **Scaffolded on Next.js 16.3.8 (see `docs/adr/0002-next-16-upgrade.md`).** Shells only — pages render empty/loading/error states, no backend wiring yet. No feature work until instructed.

## Quickstart (once scaffolded)

```bash
cp .env.example .env.local
pnpm install
pnpm dev
pnpm typecheck && pnpm lint && pnpm test
```

## Contributing

Read `AGENTS.md` (contract + invariants), then `CONTRIBUTING.md` (branches, commits, PRs with screenshots).
Auth, billing, and upload paths need extra review — see `docs/COLLABORATION.md` + `CODEOWNERS`.
