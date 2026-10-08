"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiError } from "@/lib/types";

export interface ProfileField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "email" | "tel" | "url" | "password" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

interface ProfileFormProps {
  endpoint: string;
  fields: ProfileField[];
  submitLabel: string;
  successNote: string;
  initial?: Record<string, string>;
}

/**
 * Profile + verification submit: shared by business and developer onboarding, app
 * and placement creation, the payout account, and both signup variants. The
 * backend owns the verification decision; this only reports the outcome.
 */
export function ProfileForm({
  endpoint,
  fields,
  submitLabel,
  successNote,
  initial = {},
}: ProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const missing = fields.filter((f) => f.required && !values[f.name]?.trim()).map((f) => `${f.label} is required.`);
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      await apiFetch(endpoint, { method: "POST", body: values });
      setDone(true);
      router.refresh();
    } catch (err) {
      const api = err as ApiError;
      setErrors(api.fields ? Object.values(api.fields).flat() : [api.message ?? "Could not save the profile."]);
    } finally {
      setBusy(false);
    }
  }

  const control = "mt-1 w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4" noValidate>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.label}
            {field.required && <span aria-hidden="true"> *</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => update(field.name, e.target.value)}
              className={control}
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              value={values[field.name] ?? ""}
              onChange={(e) => update(field.name, e.target.value)}
              className={control}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => update(field.name, e.target.value)}
              className={control}
            />
          )}
        </div>
      ))}

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-600">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {done && (
        <p role="status" className="text-sm text-brand-strong">
          {successNote}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
