import { requireRole } from "@/lib/auth";

export default async function FraudPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fraud alerts</h1>
      <p className="text-gray-600">No open fraud alerts.</p>
    </div>
  );
}
