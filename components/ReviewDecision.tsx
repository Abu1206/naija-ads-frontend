"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { adminEndpoints } from "@/lib/endpoints";
import type { ApiError } from "@/lib/types";

interface ReviewDecisionProps {
  kind: "business" | "developer" | "app" | "campaign" | "creative" | "payout";
  id: string;
}

/**
 * Approve / reject for one queue row. §12, §16.4 and the marketplace terms all
 * require a human decision with a reason on file, so a rejection without a
 * reason never reaches the network.
 */
export function ReviewDecision({ kind, id }: ReviewDecisionProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Decision | null>(null);

  async function decide(decision: Decision) {
    if (decision === "rejected" && !reason.trim()) {
      setError("A rejection needs a reason.");
      return;
    }
    setError(null);
    setBusy(decision);
    try {
      await apiFetch(adminEndpoints.decision, {
        method: "POST",
        body: { kind, id, decision, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      });
      setReason("");
      router.refresh();
    } catch (err) {
      const api = err as ApiError;
      setError(api.fields ? Object.values(api.fields).flat().join(" ") : api.message ?? "Decision failed.");
    } finally {
      setBusy(null);
    }
  }

  const button = (decision: Decision, label: string, className: string) => (
    <button
      type="button"
      onClick={() => decide(decision)}
      disabled={busy !== null}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${className}`}
    >
      {busy === decision ? "Saving…" : label}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`reason-${kind}-${id}`} className="sr-only">
          Reason for rejecting this {kind}
        </label>
        {button("approved", "Approve", "bg-brand text-white hover:bg-brand-strong")}
        {button("rejected", "Reject", "border hover:bg-gray-50")}
      </div>
      <input
        id={`reason-${kind}-${id}`}
        name="reason"
        placeholder="Reason (required to reject)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full max-w-xs rounded-lg border px-3 py-1.5 text-xs"
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type Decision = "approved" | "rejected";
