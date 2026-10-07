import Link from "next/link";

const NAV = [
  { href: "/business/campaigns", label: "Campaigns" },
  { href: "/business/creatives", label: "Creatives" },
  { href: "/business/analytics", label: "Analytics" },
  { href: "/business/billing", label: "Billing" },
] as const;

/** Business dashboard shell: sub-nav for campaigns, creatives, analytics, billing. */
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav aria-label="Business" className="flex flex-wrap gap-x-5 gap-y-2 border-b pb-3 text-sm">
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
