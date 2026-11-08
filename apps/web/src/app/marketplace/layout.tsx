import { Suspense } from "react";

import { BottomNav, BottomNavWithPath } from "@/components/ds/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderWithPath } from "@/components/site-header";
import { getViewer } from "@/lib/viewer";

export default function MarketplaceLayout({
  children,
}: LayoutProps<"/marketplace">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <p className="t-meta bg-ink px-4 py-2 text-center text-white/80">
        Demo · Students and listings are fictional, and no real money moves
      </p>
      <Suspense fallback={<SiteHeader activePath={null} viewer={null} />}>
        <HeaderWithViewer />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Suspense fallback={<BottomNav path={null} />}>
        <BottomNavWithPath />
      </Suspense>
    </div>
  );
}

async function HeaderWithViewer() {
  return <SiteHeaderWithPath viewer={await getViewer()} />;
}
