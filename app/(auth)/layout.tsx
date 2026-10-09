import Link from "next/link";

/** Auth shell: centered card for login/signup. Session is set by the backend. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cloud px-4 py-12">
      <Link href="/" className="font-display font-display text-xl font-bold text-ink tracking-tight text-ink">
        naija<span className="text-naija">ads</span>
      </Link>
      <div className="w-full max-w-md rounded-card border border-mist bg-white p-6">{children}</div>
    </div>
  );
}
