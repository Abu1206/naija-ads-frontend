# COLLABORATION — naija-ads-frontend

Roles, ownership, and environments for the dashboard team. Daily workflow lives in `CONTRIBUTING.md`.

## 1. Team & roles

| Role | Owns | Typical issues |
| ---- | ---- | -------------- |
| Business UI | `app/(business)`, campaign/creative/billing views | campaign CRUD, upload UX, funding states |
| Developer UI | `app/(developer)`, apps/placements/earnings | APP_ID display, placement tables, revenue splits |
| Admin UI | `app/(admin)`, review queues, fraud/audit | queues, approve/reject, alerts, audit tables |
| Platform | `lib/api.ts`, `lib/auth.ts`, `lib/types.ts`, CI, e2e | contract sync, guards, releases |
| Design/QA | `components/`, a11y, empty/loading/error states | shared tables, badges, charts, Playwright flows |
| Tech lead | RFCs, releases, branch protection, CODEOWNERS | cross-repo contract changes, `AGENTS.md` updates |

## 2. Ownership (see `.github/CODEOWNERS`)

- `app/(business)/billing/**` + `lib/api.ts` + `lib/auth.ts` → platform + 2nd reviewer.
- Upload components + creative pages → business UI + platform.
- Admin review/fraud/audit → admin owners.
- `AGENTS.md`, `docs/adr/**` → tech lead.
- Backend contract change (field rename, new endpoint) needs a linked backend issue/PR in the description.

## 3. Branch protection (see `docs/BRANCH_PROTECTION.md`)

`main`: require PR, 1 approval (2 for auth/billing/contract paths), dismiss stale approvals, require conversation resolution, require checks (`typecheck`, `lint`, `test`), no direct pushes/force-pushes. Short-lived branches (< 3 days ideal).

## 4. Decisions: RFC → ADR

RFC (`needs-rfc` issue) before code for: new routes/roles, contract changes, auth model, upload flow, UI kit/chart lib, or anything crossing frontend↔backend↔SDK. Record in `docs/adr/NNNN-title.md`; update `AGENTS.md` if invariants change.

## 5. Environments

- Local: `npm run dev` against local backend (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`).
- Preview per PR (screenshots in PR). Staging tracks backend staging (Bachs sandbox). Prod env set in host, never in git.
- Leak protocol: rotate, revoke, purge history, post-mortem issue. Tokens stay httpOnly; `NEXT_PUBLIC_*` is public — no secrets there, ever.

## 6. Communication

- Async standup weekdays (yesterday/today/blockers + issue links).
- Contract questions live in issues tagged `contract` with backend link — not DMs.
- Weekly: phase alignment with backend (P1–P7), review-queue UX, funding-state edge cases.

## 7. Ready / Done

Ready: scoped, acceptance criteria + screenshots sketch, contract endpoint noted, phase label, no RFC blocker.
Done: code + tests + screenshots, `typecheck/lint/test` green, domain reviews, squash-merged, staging verified against real backend.

## 8. Releases

Preview → staging → prod tags `v0.Y.Z` + CHANGELOG. Note the backend tag it was verified against.
