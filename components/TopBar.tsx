"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Deep Forest top bar (design-system.md): wordmark in gold, nav links in
 * white and pale green, wallet balance in gold on the right.
 * Phone-first: nav scrolls horizontally instead of a fixed sidebar.
 */
export function TopBar({
  section,
  items,
  balance,
}: {
  section: string;
  items: NavItem[];
  balance?: string;
}) {
  const pathname = usePathname();
  // Deepest matching href wins so a role's overview does not light up everywhere.
  const activeHref = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="bg-forest">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-gold">
          naija ads
        </Link>
        <nav aria-label={section} className="order-3 flex w-full gap-1 overflow-x-auto pb-1 sm:order-2 sm:w-auto sm:pb-0">
          {items.map((item) => {
            const current = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  current ? "bg-white/10 font-medium text-white" : "text-mint/70 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
                {item.badge !== undefined && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <span className="ms-auto flex items-center gap-4">
          {balance && (
            <span className="font-display text-sm font-bold text-gold" aria-label={`Balance: ${balance}`}>
              {balance}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
