import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/fraud", label: "Fraud" },
  { href: "/admin/audit", label: "Audit" },
] as const;

/** Admin dashboard shell: sub-nav for overview, reviews, payments, fraud, audit. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-2 border-b pb-3 text-sm">
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
