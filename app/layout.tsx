import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naija Ads",
  description: "Business, developer, and admin dashboards for Naija Ads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Public nav lives in the marketing layout: dashboards bring their own
            chrome and must not inherit it. */}
        <main className="min-w-0">{children}</main>
      </body>
    </html>
  );
}
