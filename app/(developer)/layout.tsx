import Link from "next/link";

const NAV = [
  { href: "/developer/apps", label: "Apps" },
  { href: "/developer/placements", label: "Placements" },
  { href: "/developer/analytics", label: "Analytics" },
  { href: "/developer/earnings", label: "Earnings" },
  { href: "/developer/payouts", label: "Payouts" },
] as const;

/** Developer dashboard shell: sub-nav for apps, placements, analytics, earnings, payouts. */
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav aria-label="Developer" className="flex flex-wrap gap-x-5 gap-y-2 border-b pb-3 text-sm">
        {NAV.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-600 hover:text-gray-900">
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
