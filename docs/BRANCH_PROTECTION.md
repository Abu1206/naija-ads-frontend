# docs/BRANCH_PROTECTION — naija-ads-frontend

Checklist for a repo admin (Settings → Branches → rule for `main`):

- [ ] Require a pull request before merging
- [ ] Required approvals: **1** (CODEOWNERS requests 2nd on auth/billing/contract paths)
- [ ] Dismiss stale approvals on new pushes
- [ ] Require conversation resolution
- [ ] Require status checks: `ci` (`typecheck`, `lint`, `test`)
- [ ] Require branches up to date before merging
- [ ] Block force pushes + deletion
