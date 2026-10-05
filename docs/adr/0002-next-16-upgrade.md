# ADR 0002: Upgrade scaffold to Next.js 16 (React 19, Tailwind v4)

- Status: accepted
- Date: 2026-10-05
- Context: AGENTS.md and ADR 0001 pinned Next.js 14, which reached EOL (security support ended Oct 2025). Latest Active LTS is Next.js 16.3.8 (security release 30 Sep 2026); Next 15 enters EOL Oct 2026. Scaffolding fresh, so no migration cost.
- Decision: Scaffold Phase 1 shells directly on Next.js 16.3.8 App Router + React 19.3.0 + Tailwind CSS v4.3.3 (CSS-first `@import "tailwindcss"`, PostCSS via `@tailwindcss/postcss`). TypeScript 5.9 (stable with Next 16; TS 7.x not yet adopted for compat). Route groups, typed `lib/api.ts`, and server-components-for-reads are unchanged from ADR 0001.
- Consequences: Gets current security patches and Active LTS support. Contributors must use Node >= 22. No feature work yet — shells render empty/loading/error states until backend phases land.
- Addendum (2026-10-05): ESLint pinned to latest 9.x (9.39.5), not 10.x. `eslint-config-next@16.3.8` bundles `eslint-plugin-react@7.37.5` (latest available, Apr 2025), which crashes on ESLint 10 (`contextOrFilename.getFilename is not a function`). Revisit when the plugin or Next config supports ESLint 10.
