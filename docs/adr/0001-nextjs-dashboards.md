# ADR 0001: Next.js App Router dashboards

- Status: accepted
- Date: 2026-10-04
- Context: Need business/developer/admin dashboards sharing auth, API client, and components. Team chose Next.js + TypeScript per init decision.
- Decision: Next.js 14 App Router with route groups `(business)`, `(developer)`, `(admin)`; typed `lib/api.ts` as the single backend client; server components for reads.
- Consequences: Clean URLs, shared layouts, contract discipline. Revisit only via RFC if routing or data-fetching needs fundamentally change.
