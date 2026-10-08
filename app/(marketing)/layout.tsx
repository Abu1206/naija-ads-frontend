import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/advertisers", label: "Advertisers" },
  { href: "/developers", label: "Developers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/tutorials", label: "Tutorials" },
] as const;

/** Public marketing shell: product pages, docs, tutorials, legal. No auth. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <nav aria-label="Product" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {PRODUCT_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-600 hover:text-gray-900">
            {l.label}
          </Link>
        ))}
        <span className="flex-1" />
        <Link
          href="/login"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
        >
          Log in
        </Link>
      </nav>
      {children}
      <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-6 text-sm text-gray-600">
        <Link href="/privacy" className="hover:text-gray-900">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-gray-900">
          Terms
        </Link>
        <Link href="/docs" className="hover:text-gray-900">
          Developer docs
        </Link>
      </footer>
    </div>
  );
}
