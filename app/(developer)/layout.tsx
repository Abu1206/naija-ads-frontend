import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/developer", label: "Overview", icon: "overview" },
  { href: "/developer/apps", label: "Apps", icon: "apps" },
  { href: "/developer/placements", label: "Placements", icon: "placements" },
  { href: "/developer/analytics", label: "Analytics", icon: "analytics" },
  { href: "/developer/earnings", label: "Earnings", icon: "earnings" },
  { href: "/developer/payouts", label: "Payouts", icon: "payouts" },
  { href: "/developer/onboarding", label: "Profile", icon: "onboarding" },
];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  await requireRole("developer");

  return (
    <DashboardShell section="Developer" items={NAV}>
      {children}
    </DashboardShell>
  );
}
