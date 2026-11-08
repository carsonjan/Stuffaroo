import type { Metadata } from "next";
import { Gluten, Inter_Tight } from "next/font/google";

import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const gluten = Gluten({
  variable: "--font-gluten",
  subsets: ["latin"],
  weight: ["900"],
});

export const metadata: Metadata = {
  title: {
    default: "Stuffaroo: buy, rent and request from UBC classmates",
    template: "%s · Stuffaroo",
  },
  description:
    "A campus marketplace where UBC students buy, rent, borrow and request everyday items from classmates, with pickup at spots on campus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${gluten.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
