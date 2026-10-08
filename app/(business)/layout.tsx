import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/business", label: "Overview", icon: "overview" },
  { href: "/business/campaigns", label: "Campaigns", icon: "campaigns" },
  { href: "/business/creatives", label: "Creatives", icon: "creatives" },
  { href: "/business/analytics", label: "Analytics", icon: "analytics" },
  { href: "/business/billing", label: "Billing", icon: "billing" },
  { href: "/business/onboarding", label: "Profile", icon: "onboarding" },
];

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  await requireRole("business");

  return (
    <DashboardShell section="Business" items={NAV}>
      {children}
    </DashboardShell>
  );
}
