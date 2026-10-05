# CONTRIBUTING — naija-ads-frontend

How many people ship three dashboards without breaking each other.

Companion docs: [`AGENTS.md`](./AGENTS.md) (build rules) · [`docs/COLLABORATION.md`](./docs/COLLABORATION.md) (roles, reviews, releases).

## 1. Branches

- `main` — always deployable, **protected** (no direct pushes).
- Short-lived branches from `main`: `feat/<issue#>-<slug>`, `fix/…`, `chore/…`, `docs/…` — e.g. `feat/15-business-campaigns-list`.
- One branch = one issue = one PR. Rebase before review. Delete after merge.

## 2. Commits — Conventional Commits

```
feat(business): add campaign list with status filter
fix(developer): show SDK secret only once after app creation
test(admin): cover review-queue empty state
docs: clarify Bachs funding pending state
chore(ci): add Playwright smoke job
```

Scope = area (`business`, `developer`, `admin`, `auth`, `components`, `lib`, `e2e`).

## 3. Issues first

No PR without a linked issue (except typo `docs:`). Templates: Feature / Bug / Task.
Labels: `phase-1…phase-7`, `auth`, `billing`, `upload`, `a11y`, `needs-rfc`, `good-first-issue`. Milestones mirror backend phases so dashboards land with APIs.

## 4. Pull requests

- **< 400 lines**, focused, CI green (`typecheck`, `lint`, `test`).
- Must include: linked issue, what/why, **screenshots or Loom for UI** (before/after + mobile width), test evidence, API contract note (which backend endpoint + version).
- Auth / billing / upload / role-guard PRs need a second reviewer (see CODEOWNERS) + e2e or guard test.
- Never ship mock data as real; fixtures stay in stories/e2e. Never put secrets in `NEXT_PUBLIC_*`.
- Squash-merge, conventional title, `Closes #n`.

## 5. Reviews

- 1 approval min; **2 for `auth`, `billing`, uploads, `lib/api.ts` contract changes**.
- Check: contract field names match backend, money display-only (kobo→₦ via `format.ts`), httpOnly auth, role guards, empty/loading/error states, a11y labels, no hardcoded URLs.
- 24h weekday SLA. Blocked > 1 day → escalate.

## 6. Tests

Colocated `*.test.ts(x)` (Vitest) + `e2e/` (Playwright). Bug fix = failing-first regression test. `pnpm typecheck` clean is merge-blocking.

## 7. Releases

Semver tags `v0.Y.Z` from `main`, CHANGELOG from commits. Preview deploy per PR; staging before prod. Contract change? Coordinate backend tag in the PR body.
