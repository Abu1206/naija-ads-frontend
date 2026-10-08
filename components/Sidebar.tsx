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

export function Sidebar({ section, items }: { section: string; items: NavItem[] }) {
  const pathname = usePathname();
  // Deepest matching href wins so a role's overview does not light up everywhere.
  const activeHref = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside className="w-60 shrink-0 border-r bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-brand">
          <Icon name="analytics" />
        </span>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          naija ads
        </Link>
      </div>
      <nav aria-label={section} className="px-3 pb-6">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {section}
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const current = item.href === activeHref;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    current ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={current ? "text-brand" : "text-gray-400"}>
                    <Icon name={item.icon} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
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
