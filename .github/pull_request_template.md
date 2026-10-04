## Linked issue

Closes # (required, except tiny `docs:` fixes)

## What / why

<!-- problem + approach. Link backend issue/PR if contract changed. -->

## Screenshots (required for UI)

| Before | After | Mobile width |
| ------ | ----- | ------------ |
|        |       |              |

## Test evidence (required)

```text
npm run typecheck
npm run lint
npm run test
```

- [ ] Unit tests added (`*.test.ts(x)`) / e2e touched for flows, guards, billing, uploads
- [ ] Empty / loading / error states covered
- [ ] Backend contract note: endpoint(s) + version verified against (e.g. backend `v0.3.0` staging):

## Impact checklist

- [ ] Auth / role guard touched? → 2 reviewers, guard tests
- [ ] Billing / funding touched? → pending-vs-confirmed states, no client money math
- [ ] Upload touched? → type/size checks + server-error display
- [ ] `lib/api.ts` / `lib/types.ts` changed? → backend link + coordinated tag
- [ ] A11y checked (labels, keyboard, contrast, no color-only meaning)
