"use client";

import { useState } from "react";
import { formatCTR, formatCount } from "@/lib/format";

export interface DeliveryPoint {
  label: string;
  impressions: number;
  clicks: number;
}

interface DeliveryChartProps {
  data: DeliveryPoint[];
  ariaLabel: string;
}

const NAIJA = "#008751";
const PINE = "#006B40";
const GOLD = "#CFA24A";
const MIST = "#D9E2D6";
const MUTED = "#4D6054";

/** Desktop combo geometry. Margins leave room for the rotated axis titles. */
const W = 640;
const H = 260;
const MARGIN = { top: 14, right: 58, bottom: 30, left: 54 };
const INNER_W = W - MARGIN.left - MARGIN.right;
const INNER_H = H - MARGIN.top - MARGIN.bottom;
const TICKS = 4;

/** Mobile single-series geometry (one metric at a time, room to breathe). */
const MW = 360;
const MH = 220;
const MM = { top: 14, right: 12, bottom: 30, left: 46 };
const MINNER_W = MW - MM.left - MM.right;
const MINNER_H = MH - MM.top - MM.bottom;

/** Frontend never invents buckets: it shows the backend series, capped at the
 * last 30 points so a daily grain renders as "last 30 days" automatically. */
const MAX_POINTS = 30;

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Period strings arrive backend-owned ("2026-10" today, "2026-10-03" once the
 * daily grain lands). Monthly labels pass through; daily ones shorten to
 * "3 Oct" for axis duty.
 */
export function deliveryLabel(period: string): string {
  const daily = /^(\d{4})-(\d{2})-(\d{2})/.exec(period);
  if (daily) {
    const d = new Date(`${daily[1]}-${daily[2]}-${daily[3]}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    }
    return period;
  }
  return period.slice(0, 7);
}

/** Headroom + snap so the CTR line gets most of the plot height. */
function ctrCeiling(values: number[]): number {
  const raw = Math.max(0, ...values);
  if (raw <= 0) return 0.01;
  const target = raw * 1.15;
  for (const step of [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.075, 0.1, 0.15, 0.2]) {
    if (target <= step) return step;
  }
  return target;
}

function pctLabel(frac: number): string {
  const v = frac * 100;
  return `${Number.isInteger(Math.round(v * 10) / 10) ? Math.round(v) : v.toFixed(1)}%`;
}

/** Show ~6 x labels max so daily points don't crowd each other out. */
function labelEvery(n: number): number {
  return n > 12 ? Math.ceil(n / 6) : 1;
}

function TooltipCard({ point, pct }: { point: DeliveryPoint; pct: number }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-10 w-max max-w-[200px] -translate-x-1/2 rounded-lg border border-mist bg-white px-3 py-2 text-xs shadow-sm"
      style={{ left: `min(max(${pct}%, 80px), calc(100% - 80px))` }}
    >
      <div className="font-bold text-ink">{point.label}</div>
      <div className="mt-1 text-muted">{formatCount(point.impressions)} impressions</div>
      <div className="text-muted">{formatCount(point.clicks)} clicks</div>
      <div className="mt-0.5 font-bold text-pine">
        {formatCTR(point.clicks, point.impressions)} CTR
      </div>
    </div>
  );
}

type MobileTab = "impressions" | "clicks" | "ctr";

const TABS: { id: MobileTab; label: string }[] = [
  { id: "impressions", label: "Impressions" },
  { id: "clicks", label: "Clicks" },
  { id: "ctr", label: "CTR" },
];

/**
 * Delivery chart, shadcn-style. Desktop: impression bars (Naija Green, left
 * "Views" axis) plus a CTR line (Matte Gold, right "CTR %" axis) — raw clicks
 * (~2% of impressions) can never work as same-axis bars, so clicks live in
 * the tooltip. Small screens: tabbed single-series views, one metric at a
 * time. Display-only: every number arrives backend-computed, no chart
 * dependency (AGENTS.md §9).
 */
export function DeliveryChart({ data, ariaLabel }: DeliveryChartProps) {
  const visible = data.slice(-MAX_POINTS);
  const [active, setActive] = useState<number | null>(null);
  const [tab, setTab] = useState<MobileTab>("impressions");
  const [mActive, setMActive] = useState<number | null>(null);

  if (visible.length === 0) return null;

  const maxImp = Math.max(1, ...visible.map((d) => d.impressions));
  const ctrs = visible.map((d) => (d.impressions > 0 ? d.clicks / d.impressions : 0));
  const maxCtr = ctrCeiling(ctrs);
  const n = visible.length;
  const slot = INNER_W / n;
  const barW = Math.min(46, slot * 0.5);
  const every = labelEvery(n);

  const x = (i: number) => MARGIN.left + slot * (i + 0.5);
  const barY = (imp: number) => MARGIN.top + INNER_H - (imp / maxImp) * INNER_H;
  const ctrY = (ctr: number) => MARGIN.top + INNER_H - (ctr / maxCtr) * INNER_H;

  const line = ctrs.map((c, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${ctrY(c).toFixed(1)}`).join(" ");

  const summary = visible
    .map((d) => `${d.label}: ${formatCount(d.impressions)} impressions, ${formatCTR(d.clicks, d.impressions)} CTR`)
    .join(", ");
  const activePoint = active !== null ? visible[active] : null;
  const mobilePoint = mActive !== null ? visible[mActive] : null;

  return (
    <figure aria-label={`${ariaLabel}. ${summary}`} className="w-full">
      <figcaption className="mb-3 hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-naija" aria-hidden="true" />
          Views (bars · left)
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden="true" className="shrink-0">
            <line x1="0" y1="4" x2="18" y2="4" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="9" cy="4" r="3" fill="#fff" stroke={GOLD} strokeWidth="2" />
          </svg>
          CTR % (line · right)
        </span>
        <span className="ml-auto">Hover or focus a point for clicks</span>
      </figcaption>

      {/* Desktop: dual-axis combo */}
      <div className="relative hidden sm:block" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="group">
          <text
            x={14}
            y={MARGIN.top + INNER_H / 2}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={MUTED}
            transform={`rotate(-90 14 ${MARGIN.top + INNER_H / 2})`}
          >
            Views
          </text>
          <text
            x={W - 12}
            y={MARGIN.top + INNER_H / 2}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={MUTED}
            transform={`rotate(90 ${W - 12} ${MARGIN.top + INNER_H / 2})`}
          >
            CTR %
          </text>
          {Array.from({ length: TICKS + 1 }, (_, i) => {
            const y = MARGIN.top + (INNER_H * i) / TICKS;
            return (
              <g key={i}>
                <line x1={MARGIN.left} x2={W - MARGIN.right} y1={y} y2={y} stroke={MIST} strokeWidth="1" />
                <text x={MARGIN.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={MUTED}>
                  {compact.format((maxImp * (TICKS - i)) / TICKS)}
                </text>
                <text x={W - MARGIN.right + 8} y={y + 3.5} textAnchor="start" fontSize="10" fill={MUTED}>
                  {pctLabel((maxCtr * (TICKS - i)) / TICKS)}
                </text>
              </g>
            );
          })}

          {visible.map((d, i) => {
            const h = (d.impressions / maxImp) * INNER_H;
            return (
              <rect
                key={dedupeKey(d.label, i)}
                x={x(i) - barW / 2}
                y={barY(d.impressions)}
                width={barW}
                height={Math.max(h, d.impressions > 0 ? 2 : 0)}
                rx="4"
                fill={active === i ? PINE : NAIJA}
              />
            );
          })}

          {n > 1 ? (
            <path d={line} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          ) : null}
          {ctrs.map((c, i) => (
            <circle
              key={dedupeKey(visible[i]!.label, i)}
              cx={x(i)}
              cy={ctrY(c)}
              r={active === i ? 5 : 3.5}
              fill={active === i ? GOLD : "#fff"}
              stroke={GOLD}
              strokeWidth="2"
            />
          ))}

          {visible.map((d, i) => (
            <rect
              key={`hit-${dedupeKey(d.label, i)}`}
              x={MARGIN.left + slot * i}
              y={MARGIN.top}
              width={slot}
              height={INNER_H}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${formatCount(d.impressions)} impressions, ${formatCount(d.clicks)} clicks, ${formatCTR(d.clicks, d.impressions)} CTR`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            />
          ))}

          {visible.map((d, i) =>
            i % every === 0 || i === n - 1 ? (
              <text
                key={`x-${dedupeKey(d.label, i)}`}
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill={active === i ? "#0C2216" : MUTED}
                fontWeight={active === i ? 700 : 400}
              >
                {d.label}
              </text>
            ) : null,
          )}
        </svg>

        {activePoint && <TooltipCard point={activePoint} pct={(x(active!) / W) * 100} />}
      </div>

      {/* Small screens: one metric at a time */}
      <div className="sm:hidden">
        <div role="tablist" aria-label="Delivery metric" className="grid grid-cols-3 gap-1 rounded-lg bg-cloud p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`delivery-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="delivery-panel"
              onClick={() => {
                setTab(t.id);
                setMActive(null);
              }}
              className={`min-h-[44px] rounded-md px-3 py-2 text-sm font-medium ${
                tab === t.id ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="delivery-panel" aria-labelledby={`delivery-tab-${tab}`} className="relative mt-3">
          <MobileSingle
            points={visible}
            kind={tab}
            active={mActive}
            onActive={setMActive}
            onLeave={() => setMActive(null)}
          />
          {mobilePoint && (
            <TooltipCard
              point={mobilePoint}
              pct={((MM.left + (MINNER_W * (mActive! + 0.5)) / visible.length) / MW) * 100}
            />
          )}
        </div>
      </div>
    </figure>
  );
}

function MobileSingle({
  points,
  kind,
  active,
  onActive,
  onLeave,
}: {
  points: DeliveryPoint[];
  kind: MobileTab;
  active: number | null;
  onActive: (i: number) => void;
  onLeave: () => void;
}) {
  const n = points.length;
  const slot = MINNER_W / n;
  const every = labelEvery(n);
  const axisTitle = kind === "impressions" ? "Views" : kind === "clicks" ? "Clicks" : "CTR %";

  const values = points.map((d) =>
    kind === "impressions" ? d.impressions : kind === "clicks" ? d.clicks : d.impressions > 0 ? d.clicks / d.impressions : 0,
  );
  const max =
    kind === "ctr"
      ? ctrCeiling(values)
      : Math.max(1, ...values);
  const y = (v: number) => MM.top + MINNER_H - (v / max) * MINNER_H;
  const x = (i: number) => MM.left + slot * (i + 0.5);
  const barW = Math.min(18, slot * 0.6);
  const line =
    kind === "ctr" && n > 1
      ? values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
      : null;

  return (
    <svg viewBox={`0 0 ${MW} ${MH}`} className="block w-full" role="group" onMouseLeave={onLeave}>
      <text
        x={12}
        y={MM.top + MINNER_H / 2}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={MUTED}
        transform={`rotate(-90 12 ${MM.top + MINNER_H / 2})`}
      >
        {axisTitle}
      </text>
      {Array.from({ length: TICKS + 1 }, (_, i) => {
        const gy = MM.top + (MINNER_H * i) / TICKS;
        const tick = (max * (TICKS - i)) / TICKS;
        return (
          <g key={i}>
            <line x1={MM.left} x2={MW - MM.right} y1={gy} y2={gy} stroke={MIST} strokeWidth="1" />
            <text x={MM.left - 6} y={gy + 3.5} textAnchor="end" fontSize="10" fill={MUTED}>
              {kind === "ctr" ? pctLabel(tick) : compact.format(tick)}
            </text>
          </g>
        );
      })}

      {kind === "ctr" ? (
        <>
          {line ? <path d={line} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /> : null}
          {values.map((v, i) => (
            <circle
              key={dedupeKey(points[i]!.label, i)}
              cx={x(i)}
              cy={y(v)}
              r={active === i ? 5 : 3.5}
              fill={active === i ? GOLD : "#fff"}
              stroke={GOLD}
              strokeWidth="2"
            />
          ))}
        </>
      ) : (
        points.map((d, i) => {
          const h = (values[i]! / max) * MINNER_H;
          return (
            <rect
              key={dedupeKey(d.label, i)}
              x={x(i) - barW / 2}
              y={y(values[i]!)}
              width={barW}
              height={Math.max(h, values[i]! > 0 ? 2 : 0)}
              rx="3"
              fill={active === i ? PINE : NAIJA}
            />
          );
        })
      )}

      {points.map((d, i) => (
        <rect
          key={`mhit-${dedupeKey(d.label, i)}`}
          x={MM.left + slot * i}
          y={MM.top}
          width={slot}
          height={MINNER_H}
          fill="transparent"
          tabIndex={0}
          role="img"
          aria-label={`${d.label}: ${formatCount(d.impressions)} impressions, ${formatCount(d.clicks)} clicks, ${formatCTR(d.clicks, d.impressions)} CTR`}
          onMouseEnter={() => onActive(i)}
          onFocus={() => onActive(i)}
          onBlur={onLeave}
        />
      ))}

      {points.map((d, i) =>
        i % every === 0 || i === n - 1 ? (
          <text
            key={`mx-${dedupeKey(d.label, i)}`}
            x={x(i)}
            y={MH - 8}
            textAnchor="middle"
            fontSize="10"
            fill={MUTED}
          >
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

function dedupeKey(label: string, i: number): string {
  return `${label}-${i}`;
}
