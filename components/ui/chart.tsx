"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

/**
 * Trimmed shadcn chart primitives (full `chart.tsx` also ships legend +
 * theming helpers we don't need). ChartContainer exposes each config entry
 * as `--color-<key>` and sizes the inner ResponsiveContainer; ChartTooltip
 * is recharts' Tooltip with our cursor style.
 */

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}) {
  const vars = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color ?? "currentColor"]),
  ) as React.CSSProperties;

  return (
    <div data-slot="chart" style={vars} className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = Tooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; payload?: unknown }>;
  label?: React.ReactNode;
  formatter?: (value: number | string, name: string) => React.ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-mist bg-white px-3 py-2 text-xs shadow-sm">
      {label != null && label !== "" && <div className="mb-1 font-bold text-ink">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5 text-muted">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            {formatter && entry.name ? formatter(entry.value ?? "", entry.name) : entry.value}
          </div>
        ))}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
