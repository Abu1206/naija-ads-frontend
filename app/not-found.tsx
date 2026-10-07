import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-gray-600">That URL isn&apos;t a dashboard, doc, or tutorial.</p>
      <Link href="/" className="inline-block underline">
        Back to home
      </Link>
    </div>
  );
}
