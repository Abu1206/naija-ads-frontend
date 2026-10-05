"use client";

import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  budget_kobo: z.coerce.number().int().positive("Budget must be a positive kobo amount."),
});

/** Campaign creation form: controlled + zod validation, server errors shown inline. */
export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, budget_kobo: budget });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }
    setErrors([]);
    // POST /api/v1/campaigns via lib/api.ts (backend live in Phase 3).
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">New campaign</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Campaign name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium">
            Budget (kobo)
          </label>
          <input
            id="budget"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        {errors.length > 0 && (
          <ul role="alert" className="list-disc pl-5 text-sm text-red-600">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Create campaign
        </button>
      </form>
    </div>
  );
}
