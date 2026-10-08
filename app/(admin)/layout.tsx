import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/reviews", label: "Review queues", icon: "reviews" },
  { href: "/admin/payments", label: "Payments", icon: "billing" },
  { href: "/admin/fraud", label: "Fraud alerts", icon: "fraud" },
  { href: "/admin/audit", label: "Audit logs", icon: "audit" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <DashboardShell section="Admin" items={NAV}>
      {children}
    </DashboardShell>
  );
}
