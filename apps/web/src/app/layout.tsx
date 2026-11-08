import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderWithPath } from "@/components/site-header";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Stuffaroo: borrow from students near you",
    template: "%s · Stuffaroo",
  },
  description:
    "A student-to-student marketplace to lend, borrow and rent the things you need for a few days instead of buying them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <p className="bg-ink px-4 py-1.5 text-center text-xs text-paper">
          Design preview: all listings, people and transactions shown are sample
          data.
        </p>
        <Suspense fallback={<SiteHeader activePath={null} />}>
          <SiteHeaderWithPath />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
