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
 * Dashboard navigation (design-system.md): a Deep Forest sidebar carrying the
 * dark-surface language — wordmark in gold, links in white and pale green,
 * active section on a soft white wash. Gold stops at the wordmark: badges and
 * icons stay neutral so gold keeps meaning money.
 * Phone-first: a horizontal strip above the content instead of a fixed column.
 */
export function Sidebar({ section, items }: { section: string; items: NavItem[] }) {
  const pathname = usePathname();
  // Deepest matching href wins so a role's overview does not light up everywhere.
  const activeHref = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside className="w-full shrink-0 bg-forest md:w-60">
      <div className="flex items-center gap-2 px-5 py-4 md:py-5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-gold">
          naija ads
        </Link>
      </div>
      <nav aria-label={section} className="px-3 pb-4 md:pb-6">
        <p className="px-2 pb-2 text-[11px] font-bold tracking-wider text-mint/50 uppercase">
          {section}
        </p>
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {items.map((item) => {
            const current = item.href === activeHref;
            return (
              <li key={item.href} className="shrink-0 md:shrink">
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${
                    current ? "bg-white/10 font-medium text-white" : "text-mint/70 hover:text-white"
                  }`}
                >
                  <span className={current ? "text-white" : "text-mint/50"}>
                    <Icon name={item.icon} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
