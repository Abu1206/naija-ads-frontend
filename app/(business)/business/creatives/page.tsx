"use client";

import { UploadDropzone } from "@/components/UploadDropzone";

// Phase 3: request presigned R2 URL from backend -> PUT file -> confirm metadata.
export default function CreativesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Creatives</h1>
      <UploadDropzone
        onFile={() => {
          // Upload flow lands with the backend presigned-URL endpoint.
        }}
      />
    </div>
  );
}
