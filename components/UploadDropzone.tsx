"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** Client-side type/size pre-check. Server rejection is still expected/handled. */
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "video/mp4",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB client pre-check; server validates for real.

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, disabled = false }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handle(file: File | undefined) {
    if (disabled) return;
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported type ${file.type || "unknown"}. Use PNG, JPEG, MP4, MP3, M4A or WAV.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large (max 5MB).");
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="creative-upload"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        disabled={disabled}
        className="peer sr-only"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <label
        htmlFor="creative-upload"
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-mist bg-cloud px-6 py-10 text-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-naija",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-naija/50 hover:bg-mint/40",
          dragging && !disabled && "border-naija bg-mint",
        )}
      >
        <span
          className={cn(
            "rounded-full p-2.5",
            dragging && !disabled ? "bg-naija text-white" : "bg-white text-pine",
          )}
          aria-hidden="true"
        >
          <Icon name="plus" size={20} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">Drop a creative here or click to browse</span>
          <span className="mt-1 block text-xs text-muted">PNG, JPEG, MP4, MP3, M4A or WAV. Max 5MB.</span>
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
