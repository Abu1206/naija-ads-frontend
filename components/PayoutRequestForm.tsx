"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { nairaInputToKobo } from "@/lib/format";
import type { ApiError, Payout } from "@/lib/types";

const schema = z.object({
  naira: z.coerce.number().positive("Enter an amount greater than zero."),
});

/**
 * Requests a payout from the backend. The amount is sent in kobo; whether it
 * clears is the server's call — available balance, fraud holds and admin review
 * all live there (spec §17), so nothing here checks the balance first.
 */
export function PayoutRequestForm() {
  const router = useRouter();
  const [naira, setNaira] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState<Payout | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ naira });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      const payout = await apiFetch<Payout>(endpoints.payouts, {
        method: "POST",
        body: { amount_kobo: nairaInputToKobo(parsed.data.naira) },
      });
      setRequested(payout);
      setNaira("");
      router.refresh();
    } catch (err) {
      const api = err as ApiError;
      setErrors(api.fields ? Object.values(api.fields).flat() : [api.message ?? "Could not request the payout."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4" noValidate>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount (₦)
        </label>
        <input
          id="amount"
          name="amount"
          inputMode="decimal"
          value={naira}
          onChange={(e) => setNaira(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-600">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {requested && (
        <p role="status" className="text-sm text-brand-strong">
          Payout requested — awaiting admin review.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
      >
        {busy ? "Requesting…" : "Request payout"}
      </button>
    </form>
  );
}
