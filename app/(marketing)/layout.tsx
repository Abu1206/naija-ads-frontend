import Link from "next/link";
import { Button } from "@/components/Button";

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
    <div className="min-h-screen bg-cloud">
      <div className="bg-forest">
        <nav
          aria-label="Product"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm sm:px-6"
        >
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-gold">
            naija ads
          </Link>
          {PRODUCT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-mint/70 hover:text-white">
              {l.label}
            </Link>
          ))}
          <span className="flex-1" />
          <Link href="/login">
            <Button variant="primary" className="min-h-0 py-1.5">
              Log in
            </Button>
          </Link>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">{children}</div>
      <footer className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 border-t border-mist px-4 py-6 text-sm text-muted sm:px-6">
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-ink">
          Terms
        </Link>
        <Link href="/docs" className="hover:text-ink">
          Developer docs
        </Link>
      </footer>
    </div>
  );
}
