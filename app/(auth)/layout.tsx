import Link from "next/link";

/** Auth shell: centered card for login/signup. Session is set by the backend. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-12">
      <Link href="/" className="inline-block text-lg font-semibold tracking-tight">
        naija ads
      </Link>
      {children}
    </div>
  );
}
