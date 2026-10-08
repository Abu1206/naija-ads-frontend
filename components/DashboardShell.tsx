import Link from "next/link";
import { Icon } from "./Icon";
import { Sidebar, type NavItem } from "./Sidebar";

// Layouts declare their nav arrays against this type; re-exported so they do not
// have to reach into Sidebar.tsx for it.
export type { NavItem };

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
}

export function PageHeader({ title, subtitle, cta }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
        >
          <Icon name="plus" className="h-4 w-4" />
          {cta.label}
        </Link>
      )}
    </header>
  );
}

export function DashboardShell({
  section,
  items,
  children,
}: {
  section: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen border-t bg-white">
      <Sidebar section={section} items={items} />
      <div className="min-w-0 flex-1 bg-gray-50 px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
