"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { ApiError } from "@/lib/types";
import { Button } from "./Button";
import { Field, FieldErrors, TextInput } from "./Field";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

/**
 * Posts credentials to the backend and hands off to `/`, which routes a signed-in
 * session to its own dashboard. The httpOnly session cookie is set by the server —
 * nothing here stores a token (AGENTS.md §6.2).
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      await apiFetch(endpoints.authLogin, { method: "POST", body: parsed.data });
      router.replace("/");
    } catch (err) {
      const api = err as ApiError;
      setErrors(api.fields ? Object.values(api.fields).flat() : [api.message ?? "Could not log in."]);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field id="email" label="Email">
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field id="password" label="Password">
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <FieldErrors errors={errors} />

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
