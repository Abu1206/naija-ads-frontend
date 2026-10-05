import { requireRole } from "@/lib/auth";

// Phase 5: redirect to backend-created Bachs checkout URL; success screen polls
// GET /payments/:id until the webhook confirms the ledger credit.
export default async function BillingPage() {
  await requireRole("business");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-gray-600">
        Fund your account with Bachs. Credits appear after webhook confirmation — never trust the
        redirect alone.
      </p>
      <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white">
        Fund via Bachs
      </button>
    </div>
  );
}
