# ADR 0003 — Mock data layer while the backend is undeployed

- Status: accepted
- Date: 2026-10-09
- Supersedes: nothing
- Relates to: ADR 0001 (Next.js dashboards)

## Context

The Go backend is still in development and not deployed. Every dashboard page
reads through `load<T>(path)` and every form writes through
`apiFetch<T>(path)`, so with no server reachable all 17 pages render their error
state. That makes the frontend impossible to style, review or hand over: there is
nothing to look at.

AGENTS.md §6.6 forbids mock data in merged PRs outside `*.stories.*` and e2e
fixtures. That rule protects a shipped product from pretending to work. It was
written for a repo whose backend exists.

## Decision

Run the frontend against an in-memory fixture layer, switched by
`NEXT_PUBLIC_DATA_SOURCE`, defaulting to `mock`.

- `lib/mock/data.ts` — the dataset, typed against `lib/types.ts`.
- `lib/mock/store.ts` — resolves a path to fixtures, applies writes, parks the
  mutable state on `globalThis` so a dev reload does not resurrect seed data.
- `lib/api.ts` — `load()` and `apiFetch()` delegate to the mock layer. **No page,
  component or form changed**, because the swap happens at the transport.
- `app/api/dev/[...path]/route.ts` — the write endpoint. `apiFetch` runs in the
  browser and cannot reach the server's store, so writes POST here.
- `lib/mock/actions.ts` — dev-only server actions that mint the session cookie.
- `components/DevSession.tsx` — the role switcher, rendered only in mock mode.

## Consequences

**What it buys.** Every screen renders real-looking data at real scale, including
empty-ish and mixed status ladders. Forms complete, optimistic states are
styleable, and the whole surface can be reviewed and screenshotted.

**Switching back is one env var.** `NEXT_PUBLIC_DATA_SOURCE=live` and the app
calls the Go API with no code change, because the fixture layer sits behind the
same `load()` / `apiFetch()` seams the real client uses. No page knows which
transport it is talking to.

**§6.6 is suspended, not repealed.** `lib/mock/**` is clearly labelled, the dev
routes 404 in a live build, and `DevSession` returns `null` unless mock mode is
on. When the backend ships:

1. Set `NEXT_PUBLIC_DATA_SOURCE=live`.
2. Delete `components/DevSession.tsx` and `app/api/dev/**`.
3. Delete `lib/mock/**` and the `isMock()` branches in `lib/api.ts`.

Steps 1–3 are listed in `docs/DASHBOARD_BUILD.md` §7 so they are not forgotten.
Until then, §6.6 holds everywhere else.

**What it does not do.** It does not verify the real API contract. Every
`*_kobo` value is a literal a human wrote, so a wrong field name or unit in
`lib/types.ts` renders happily here and only fails against the server. The
contract mirror is still unproven until the first live request — the fixtures are
a styling aid, not evidence.

## Alternatives considered

- **Leave pages on error states.** Rejected: nothing to style, and no way to
  review the UI at all.
- **Per-component `*.stories.*` fixtures.** The §6.6 carve-out. Rejected: 17 pages
  of server-rendered composition would still be unreviewable, and stories would
  drift from the real page structure.
- **MSW intercepting at the network layer.** Closest to the real transport, but it
  only intercepts browser requests. The 17 pages read in server components, so it
  would have covered writes and missed every read.
- **Stand up a stub Go server.** The most faithful option, and the most expensive:
  a second codebase to keep in sync while the real one is still moving.
