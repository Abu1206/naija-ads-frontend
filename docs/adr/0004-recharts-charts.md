# ADR 0004: shadcn charts (recharts) for delivery analytics

- Status: accepted
- Date: 2026-10-09
- Context: Grouped same-axis bars flattened clicks (~2% of impressions) into an unreadable line. The hand-rolled SVG combo worked but duplicated what shadcn's chart pattern (recharts + Card + ChartContainer/Tooltip) already solves, including keyboard/hover tooltips and responsive containers.
- Decision: Adopt `recharts` for delivery charts only (`components/DeliveryChart.tsx`: desktop `ComposedChart` with Views bars + CTR line on dual axes; tabbed single-series `BarChart`/`LineChart` below `sm`). Add `components/ui/card.tsx` + `components/ui/chart.tsx` (trimmed shadcn primitives on project tokens) and `lib/utils.ts` (`cn`, dependency-free). No `lucide-react` — `components/Icon.tsx` stays the only icon source. No other chart lib without a new RFC.
- Consequences: One sanctioned chart dependency; chart colors stay on tokens (Naija Green bars, Matte Gold CTR line). Revisit only via RFC if a second chart lib or full shadcn component set is wanted.
