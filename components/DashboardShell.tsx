import Link from "next/link";
import { Button } from "./Button";
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {cta && (
        <Link href={cta.href}>
          <Button variant="primary">
            <Icon name="plus" className="h-4 w-4" />
            {cta.label}
          </Button>
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
    <div className="min-h-screen bg-cloud md:flex">
      <Sidebar section={section} items={items} />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
