import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-8 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="text-sm text-muted">That URL isn&apos;t a dashboard, doc, or tutorial.</p>
      <Link href="/" className="inline-block underline">
        Back to home
      </Link>
    </div>
  );
}
