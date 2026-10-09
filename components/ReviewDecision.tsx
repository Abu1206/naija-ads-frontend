"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { adminEndpoints } from "@/lib/endpoints";
import type { ApiError } from "@/lib/types";
import { Button } from "./Button";
import { TextInput } from "./Field";

interface ReviewDecisionProps {
  kind: "business" | "developer" | "app" | "campaign" | "creative" | "payout";
  id: string;
}

/**
 * Approve / reject for one queue row. §12, §16.4 and the marketplace terms all
 * require a human decision with a reason on file, so a rejection without a
 * reason never reaches the network. Destructive action is outlined red, never
 * filled (design-system.md) — red stays rare so it keeps meaning "look here".
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span id={`reason-label-${kind}-${id}`} className="sr-only">
          Reason for rejecting this {kind} (required to reject)
        </span>
        <Button
          type="button"
          variant="primary"
          onClick={() => decide("approved")}
          disabled={busy !== null}
          className="px-3 py-1.5 text-xs"
        >
          {busy === "approved" ? "Saving…" : "Approve"}
        </Button>
        <Button
          type="button"
          variant="danger-outline"
          onClick={() => decide("rejected")}
          disabled={busy !== null}
          className="px-3 py-1.5 text-xs"
        >
          {busy === "rejected" ? "Saving…" : "Reject"}
        </Button>
      </div>
      <TextInput
        id={`reason-${kind}-${id}`}
        name="reason"
        aria-labelledby={`reason-label-${kind}-${id}`}
        placeholder="Reason (required to reject)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="max-w-xs text-sm"
      />
      {error && (
        <p role="alert" className="text-xs text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

type Decision = "approved" | "rejected";
