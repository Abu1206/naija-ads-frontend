"use client";

import { useState } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { nairaInputToKobo } from "@/lib/format";
import type { ApiError, Payment } from "@/lib/types";

const schema = z.object({
  naira: z.coerce.number().positive("Enter an amount greater than zero."),
});

/**
 * Opens a Bachs checkout created by the backend (spec §16). A redirect back is
 * not a credit: the ledger row below only moves to `confirmed` once the webhook
 * has been verified server-side.
 */
export function FundForm() {
  const [naira, setNaira] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

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
      const payment = await apiFetch<Payment>(endpoints.payments, {
        method: "POST",
        body: { amount_kobo: nairaInputToKobo(parsed.data.naira) },
      });
      window.location.assign(payment.checkout_url);
    } catch (err) {
      const api = err as ApiError;
      setErrors(api.fields ? Object.values(api.fields).flat() : [api.message ?? "Could not open checkout."]);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : "Fund via Bachs"}
      </button>
    </form>
  );
}
