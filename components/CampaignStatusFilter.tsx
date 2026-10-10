"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  STATUS_FILTER_LABELS,
  STATUS_FILTER_ORDER,
  type StatusFilter,
} from "@/lib/campaignStatus";
import { ValuePicker } from "./ValuePicker";

/**
 * Table filter in the card header (title left, picker right, like the chart):
 * status is server state, so changing it navigates and the server refilters —
 * the transition dims the trigger instead of flashing a spinner.
 */
export function CampaignStatusFilter({ value }: { value: StatusFilter }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const go = (next: StatusFilter) => {
    if (next === value) return;
    const qs = new URLSearchParams(searchParams.toString());
    if (next === "all") qs.delete("status");
    else qs.set("status", next);
    const query = qs.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <ValuePicker
      label="Campaign status"
      value={value}
      options={["all", ...STATUS_FILTER_ORDER] as const}
      labels={STATUS_FILTER_LABELS}
      onValueChange={go}
      busy={isPending}
    />
  );
}
