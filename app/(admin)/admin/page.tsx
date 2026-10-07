import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { MetricCard } from "@/components/MetricCard";
import { formatCTR, formatECPM, formatFillRate } from "@/lib/format";

const QUEUES = [
  { href: "/admin/reviews", title: "Review queue", body: "Businesses, developers, apps, campaigns, creatives awaiting verification." },
  { href: "/admin/payments", title: "Payments", body: "Advertiser spend, developer earnings, payouts, eCPM." },
  { href: "/admin/fraud", title: "Fraud alerts", body: "Flagged traffic, CTR anomalies, payout holds." },
  { href: "/admin/audit", title: "Audit logs", body: "Spend, funding, earnings, payouts, approvals — everything financial." },
] as const;

/** Admin overview: network health at a glance + entry points to every queue. */
export default async function AdminOverviewPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Active campaigns" value="—" />
        <MetricCard label="Impressions" value="—" />
        <MetricCard label="Fill rate" value={formatFillRate(0, 0)} />
        <MetricCard label="CTR" value={formatCTR(0, 0)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {QUEUES.map((q) => (
          <Link key={q.href} href={q.href} className="rounded border bg-white p-4 hover:bg-gray-50">
            <p className="font-medium">{q.title}</p>
            <p className="text-sm text-gray-600">{q.body}</p>
          </Link>
        ))}
      </div>
      <MetricCard label="eCPM (network)" value={formatECPM(0, 0)} />
    </div>
  );
}
