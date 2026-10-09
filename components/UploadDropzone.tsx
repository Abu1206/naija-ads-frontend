"use client";

import { useState } from "react";

/** Client-side type/size pre-check. Server rejection is still expected/handled. */
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "video/mp4"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB client pre-check; server validates for real.

interface UploadDropzoneProps {
  onFile: (file: File) => void;
}

export function UploadDropzone({ onFile }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  function handle(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported type ${file.type || "unknown"}. Use PNG, JPEG, or MP4.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large — max 5MB.");
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <label
        htmlFor="creative-upload"
        className="block cursor-pointer rounded-card border-2 border-dashed border-mist bg-cloud p-8 text-center text-muted hover:border-naija"
      >
        Drop a creative here or click to browse (PNG / JPEG / MP4, max 5MB)
      </label>
      <input
        id="creative-upload"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
