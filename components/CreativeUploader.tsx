"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ValuePicker } from "@/components/ValuePicker";
import { apiFetch } from "@/lib/api";
import { creativeEndpoints } from "@/lib/endpoints";
import type { AdType, ApiError, Campaign } from "@/lib/types";
import { AD_TYPES } from "@/lib/types";

interface UploadIntent {
  creative_id: string;
  upload_url: string;
}

const FORMAT_LABELS: Record<AdType, string> = {
  banner: "Banner",
  interstitial: "Interstitial",
  rewarded: "Rewarded",
  audio: "Audio",
};

interface CreativeUploaderProps {
  campaigns: Pick<Campaign, "id" | "name">[];
}

/**
 * Presigned R2 flow (AGENTS.md §4): ask the backend for an upload URL, PUT the
 * bytes, then confirm metadata with the campaign link. The PUT deliberately
 * bypasses lib/api.ts because that client forces JSON headers, which would
 * break the presigned signature.
 */
export function CreativeUploader({ campaigns }: CreativeUploaderProps) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState<string>(campaigns[0]?.id ?? "");
  const [adType, setAdType] = useState<AdType>("banner");
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const campaignOptions = campaigns.map((c) => c.id);
  const campaignLabels = Object.fromEntries(campaigns.map((c) => [c.id, c.name])) as Record<string, string>;
  const ready = campaignId !== "";

  async function upload(file: File) {
    if (busy || !ready) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    setFileName(file.name);
    try {
      setStatus("Requesting an upload URL…");
      const intent = await apiFetch<UploadIntent>(creativeEndpoints.uploadIntent, {
        method: "POST",
        body: {
          ad_type: adType,
          campaign_id: campaignId,
          file_name: file.name,
          content_type: file.type,
          size_bytes: file.size,
        },
      });

      setStatus("Uploading creative…");
      const put = await fetch(intent.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) throw { status: put.status, message: `Storage rejected the upload (${put.status}).` } as ApiError;

      setStatus("Confirming metadata…");
      await apiFetch(creativeEndpoints.confirm, {
        method: "POST",
        body: {
          creative_id: intent.creative_id,
          campaign_id: campaignId,
          ad_type: adType,
          size_bytes: file.size,
        },
      });

      setStatus(null);
      setSuccess(`${file.name} uploaded. It is now submitted for review.`);
      router.refresh();
    } catch (err) {
      setStatus(null);
      setError((err as ApiError).message ?? "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-muted">
        Create a campaign first, then upload artwork for it here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Campaign this creative serves</span>
          <ValuePicker
            label="Campaign this creative serves"
            value={campaignId}
            options={campaignOptions}
            labels={campaignLabels}
            busy={busy}
            onValueChange={(next) => {
              if (!busy) setCampaignId(next);
            }}
            className="w-full"
          />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Format this creative serves</span>
          <ValuePicker
            label="Format this creative serves"
            value={adType}
            options={AD_TYPES}
            labels={FORMAT_LABELS}
            busy={busy}
            onValueChange={(next) => {
              if (!busy) setAdType(next);
            }}
            className="w-full"
          />
        </div>
      </div>

      <UploadDropzone onFile={upload} disabled={busy} />

      {busy && (
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {fileName ? `${fileName}: ${status}` : status}
        </p>
      )}
      {success && !busy && (
        <p role="status" className="text-sm text-pine">
          {success}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
