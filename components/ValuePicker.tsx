"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHighlight,
  DropdownMenuHighlightItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/primitives/radix/dropdown-menu";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface ValuePickerProps<T extends string> {
  /** Accessible name on the trigger — there is no visible label. */
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onValueChange: (value: T) => void;
  /** Trigger reads busy while the selection refetches (range changes). */
  busy?: boolean;
  /** Layout only: width behaviour inside the toolbar row. */
  className?: string;
}

/**
 * The one dropdown in the app: a labelled trigger that shows the current value
 * and a menu of radio items. Animate-UI's Radix dropdown-menu primitive carries
 * the motion — the mint pill springs between highlighted items (motion is
 * configured reduced-motion-aware by the caller's MotionConfig), the content
 * fades and scales in — while the interaction stays keyboard-native: arrow keys,
 * typeahead and Escape come from Radix, not from us.
 *
 * The trigger is a small bordered box — 1px Mist on white, semibold ink label
 * with a chevron: the label matches the card heading's weight exactly, so
 * the two sit on one level, and the chevron plus hover state mark it as a
 * control rather than content. Height stays 44px for the touch minimum, and
 * the menu keeps the 14px card radius with a 1px Mist border and no shadow,
 * Naija Green tick for the current value. Colour is never the only signal —
 * the tick and the label both mark the selection.
 */
export function ValuePicker<T extends string>({
  label,
  value,
  options,
  labels,
  onValueChange,
  busy = false,
  className,
}: ValuePickerProps<T>) {
  return (
    // Non-modal: this menu sits in a toolbar over live content — blocking
    // page scroll and hiding the rest of the page from assistive tech while
    // it is open would cost more than the focus trap buys.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={label}
        aria-busy={busy}
        className={cn(
          "flex h-11 min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg border border-mist bg-white px-2.5 font-display text-sm font-semibold text-ink transition-colors hover:border-naija/40 hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none",
          busy && "opacity-60",
          className,
        )}
      >
        <span className="truncate">{labels[value]}</span>
        <Icon name="chevron-down" size={16} className="text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-50 w-52 rounded-card border border-mist bg-white p-1"
      >
        <DropdownMenuHighlight mode="parent" className="rounded-md bg-mint">
          <DropdownMenuRadioGroup value={value} onValueChange={(next) => onValueChange(next as T)}>
            {options.map((option) => (
              <DropdownMenuHighlightItem key={option} value={option}>
                <DropdownMenuRadioItem
                  value={option}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm font-medium text-ink outline-none data-[state=checked]:font-semibold"
                >
                  <span className="flex-1 truncate">{labels[option]}</span>
                  {value === option && <Icon name="tick" size={16} className="text-naija" />}
                </DropdownMenuRadioItem>
              </DropdownMenuHighlightItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuHighlight>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
