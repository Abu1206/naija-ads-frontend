"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { apiFetch } from "@/lib/api";
import { creativeEndpoints } from "@/lib/endpoints";
import type { AdType, ApiError } from "@/lib/types";

interface UploadIntent {
  creative_id: string;
  upload_url: string;
}

const FORMATS: AdType[] = ["banner", "interstitial", "rewarded"];

/**
 * Presigned R2 flow (AGENTS.md §4): ask the backend for an upload URL, PUT the
 * bytes, then confirm metadata. The PUT deliberately bypasses lib/api.ts because
 * that client forces JSON headers, which would break the presigned signature.
 */
export function CreativeUploader() {
  const router = useRouter();
  const [adType, setAdType] = useState<AdType>("banner");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      setStatus("Requesting an upload URL…");
      const intent = await apiFetch<UploadIntent>(creativeEndpoints.uploadIntent, {
        method: "POST",
        body: { ad_type: adType, file_name: file.name, content_type: file.type, size_bytes: file.size },
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
        body: { creative_id: intent.creative_id },
      });

      setStatus(null);
      router.refresh();
    } catch (err) {
      setStatus(null);
      setError((err as ApiError).message ?? "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="upload-format" className="block text-sm font-medium">
          Format this creative serves
        </label>
        <select
          id="upload-format"
          value={adType}
          onChange={(e) => setAdType(e.target.value as AdType)}
          className="mt-1 w-full rounded-lg border px-3 py-2 sm:w-56"
        >
          {FORMATS.map((format) => (
            <option key={format} value={format} className="capitalize">
              {format}
            </option>
          ))}
        </select>
      </div>

      <UploadDropzone onFile={upload} />

      {busy && (
        <p role="status" aria-live="polite" className="text-sm text-gray-500">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500">
        The client only pre-checks type and size; the backend re-validates dimensions, metadata and
        format rules and can still reject this creative.
      </p>
    </div>
  );
}
