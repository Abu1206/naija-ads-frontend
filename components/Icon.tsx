// THE icon pack for this project. Nothing else renders glyphs — no lucide,
// no heroicons, no react-icons, no hand-rolled SVG paths. Every icon in the
// app goes through this `Icon` wrapper so size, stroke and colour stay
// consistent and swapping a glyph is a one-line mapping change below.
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  ArrowDown01Icon,
  Audit01Icon,
  BankIcon,
  BellIcon,
  CheckmarkBadge02Icon,
  CollapseIcon,
  DashboardSquare02Icon,
  Image02Icon,
  LayoutGridIcon,
  Megaphone02Icon,
  MoneyBag02Icon,
  ShieldAlertIcon,
  SmartPhone01Icon,
  Tick02Icon,
  UserAccountIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons";

const ICONS = {
  overview: DashboardSquare02Icon,
  campaigns: Megaphone02Icon,
  creatives: Image02Icon,
  analytics: Analytics01Icon,
  billing: Wallet02Icon,
  apps: SmartPhone01Icon,
  placements: LayoutGridIcon,
  earnings: MoneyBag02Icon,
  payouts: BankIcon,
  reviews: CheckmarkBadge02Icon,
  fraud: ShieldAlertIcon,
  audit: Audit01Icon,
  onboarding: UserAccountIcon,
  plus: Add01Icon,
  bell: BellIcon,
  collapse: CollapseIcon,
  "chevron-down": ArrowDown01Icon,
  tick: Tick02Icon,
} as const;

export type IconName = keyof typeof ICONS;

/**
 * Sizing comes from the `size` prop (default 20, matching h-5), so callers that
 * need a smaller glyph inside a control (a chevron in a 44px trigger) pass
 * 16 instead of fighting Tailwind classes.
 */
export function Icon({
  name,
  className = "",
  size = 20,
}: {
  name: IconName | string;
  className?: string;
  size?: number;
}) {
  const icon = (ICONS as Record<string, (typeof ICONS)[IconName]>)[name] ?? ICONS.overview;
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    />
  );
}
