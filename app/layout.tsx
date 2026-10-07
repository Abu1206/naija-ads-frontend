import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naija Ads",
  description: "Business, developer, and admin dashboards for Naija Ads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3" aria-label="Primary">
            <Link href="/" className="font-bold">
              Naija Ads
            </Link>
            <Link href="/advertisers" className="text-sm text-gray-600 hover:text-gray-900">
              Advertisers
            </Link>
            <Link href="/developers" className="text-sm text-gray-600 hover:text-gray-900">
              Developers
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900">
              Docs
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
