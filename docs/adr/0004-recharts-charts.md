# ADR 0004: shadcn charts (recharts) for delivery analytics

- Status: accepted
- Date: 2026-10-09
- Context: Grouped same-axis bars flattened clicks (~2% of impressions) into an unreadable line. The hand-rolled SVG combo worked but duplicated what shadcn's chart pattern (recharts + Card + ChartContainer/Tooltip) already solves, including keyboard/hover tooltips and responsive containers.
- Decision: Adopt `recharts` for delivery charts only (`components/DeliveryChart.tsx`: desktop `ComposedChart` with Views bars + CTR line on dual axes; tabbed single-series `BarChart`/`LineChart` below `sm`). Add `components/ui/card.tsx` + `components/ui/chart.tsx` (trimmed shadcn primitives on project tokens) and `lib/utils.ts` (`cn`, dependency-free). No `lucide-react` — `components/Icon.tsx` stays the only icon source. No other chart lib without a new RFC.
- Consequences: One sanctioned chart dependency; chart colors stay on tokens (Naija Green bars, deeper chart-only CTR gold #A87A1F — Matte Gold stays on money surfaces). Revisit only via RFC if a second chart lib or full shadcn component set is wanted.

## Amendment 2026-10-09: ranged windows with URL state

- Context: "Last 3 / All (6)" on six monthly points offered no real choice, and the
  monthly grain renders a half-finished current month as a short bar while
  comparing months with different day counts.
- Decision: ranges `7D / 30D / 90D / 6M` (default 30D) change the grain, not just
  the slice — daily, daily, weekly, monthly — via an assumed `range` param on
  `GET /api/v1/analytics` (`lib/endpoints.ts:analyticsFor`, mock in
  `lib/mock/series.ts` + `store.ts`; the Go backend owns the real buckets).
  Every plotted point is a full period, so no partial-month bar can render.
  `components/DeliveryChartSection.tsx` owns the URL (`?range=30d&metric=ctr`):
  range navigates (server refetches the window, the transition dims the old
  chart instead of a spinner), metric mirrors via replaceState with no
  refetch. The toolbar controls are 44px dropdown pickers (ADR 0005:
  `components/ValuePicker.tsx` on the animate-UI Radix dropdown menu; metric
  left, range right; the pills and native selects before them both lost).
  `DeliveryChart.tsx` stays purely presentational and never slices or
  re-buckets. Under 3 points renders the empty state ("Your chart appears once
  ads start delivering"). Both axes run zero-based with five equal round steps
  (`barAxis`/`ctrAxis`), so gridlines coincide; nearest-step rounding with a
  no-clipping guard lands 30-day peaks on 0–100K by 20K and 0–5% by 1%. CTR
  lines are linear with dots only on hover — smoothing made day-to-day noise
  read as a trend. Vocabulary is fixed: "Impressions" everywhere (card,
  dropdown, legend, axis); "Views" is gone. Window deltas compare the selected
  window against the equal-length one before it (`previous_window` in the API
  contract; `windowDeltas` in `lib/insights.ts`), captioned "vs previous 30
  days" — never a bare period label. No custom picker or compare-to-previous —
  the four presets cover current needs.
- Consequences: pages read `searchParams` (dynamic rendering) and key the
  section by range+metric so back/forward remounts with fresh URL state. KPI
  deltas compare the window's last two points (day-over-day on daily windows).
