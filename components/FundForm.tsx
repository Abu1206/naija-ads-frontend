"use client";

import { useState } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { nairaInputToKobo } from "@/lib/format";
import type { ApiError, Payment } from "@/lib/types";
import { Button } from "./Button";
import { Field, FieldErrors, TextInput } from "./Field";

const schema = z.object({
  naira: z.coerce.number().positive("Enter an amount greater than zero."),
});

/** One-tap amounts that fill the field — convenience only, typed the same way. */
const QUICK_AMOUNTS = ["5000", "10000", "50000", "100000"] as const;

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
    <form onSubmit={onSubmit} className="max-w-xl space-y-4" noValidate>
      <Field id="amount" label="Amount">
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
            ₦
          </span>
          <TextInput
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="10,000"
            value={naira}
            onChange={(e) => setNaira(e.target.value)}
            className="pl-8"
          />
        </div>
      </Field>
      <div className="flex flex-wrap gap-2" aria-label="Quick amounts">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={busy}
            onClick={() => {
              setNaira(amount);
              setErrors([]);
            }}
            aria-pressed={naira === amount}
            className={`inline-flex h-11 items-center rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija disabled:cursor-not-allowed disabled:opacity-60 ${
              naira === amount
                ? "border-naija bg-mint text-pine"
                : "border-mist bg-white text-ink hover:border-naija/40"
            }`}
          >
            ₦{Number(amount).toLocaleString("en-NG")}
          </button>
        ))}
      </div>
      <FieldErrors errors={errors} />
      {/* Gold sits next to money: funding is the one place a gold button lives. */}
      <Button type="submit" variant="gold" disabled={busy}>
        {busy ? "Opening checkout…" : "Fund wallet via Bachs"}
      </Button>
    </form>
  );
}
