import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderWithPath } from "@/components/site-header";
import { getViewer } from "@/lib/viewer";

export default function MarketplaceLayout({
  children,
}: LayoutProps<"/marketplace">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <p className="bg-ink px-4 py-1.5 text-center text-xs text-paper">
        Design preview: all listings, people and transactions shown are sample
        data.
      </p>
      <Suspense fallback={<SiteHeader activePath={null} viewer={null} />}>
        <HeaderWithViewer />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

async function HeaderWithViewer() {
  return <SiteHeaderWithPath viewer={await getViewer()} />;
}
