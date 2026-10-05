import { requireRole } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";

export default async function PayoutsPage() {
  await requireRole("developer");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <p className="text-gray-600">Pending vs available earnings and payout status.</p>
      <StatusBadge status="pending" />
    </div>
  );
}
