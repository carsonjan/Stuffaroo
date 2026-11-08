import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";

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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
