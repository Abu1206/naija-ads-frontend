import type { Metadata } from "next";
import { DM_Sans, Quicksand } from "next/font/google";
import "./globals.css";

// Two families only (design-system.md): Quicksand 600/700 for headings and
// money, DM Sans for body/buttons/labels/fields. Few weights on purpose —
// first load stays fast on mobile data.
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naija Ads",
  description: "Business, developer, and admin dashboards for Naija Ads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-cloud font-sans text-ink antialiased">
        {/* Public nav lives in the marketing layout: dashboards bring their own
            chrome and must not inherit it. */}
        <main className="min-w-0">{children}</main>
      </body>
    </html>
  );
}
