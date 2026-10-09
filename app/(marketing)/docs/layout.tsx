import Link from "next/link";

const NAV = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/web-sdk", label: "Web SDK" },
  { href: "/docs/formats", label: "Formats & placements" },
  { href: "/docs/test-mode", label: "Test mode" },
] as const;

/** Developer docs shell: sidebar nav + content. Public, no auth. */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <nav aria-label="Developer docs" className="space-y-1 text-sm">
        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex min-h-[44px] items-center rounded px-3 py-2 text-muted hover:bg-cloud hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <article className="min-w-0">{children}</article>
    </div>
  );
}
