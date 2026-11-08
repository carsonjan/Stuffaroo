import { Suspense } from "react";

import {
  DashboardNav,
  DashboardNavWithPath,
} from "@/components/dashboard/dashboard-nav";
import { CURRENT_USER_ID, getProfile } from "@/lib/mock-data";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const me = getProfile(CURRENT_USER_ID);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10">
      <p className="text-sm text-muted-foreground">{me?.campus}</p>
      <h1 className="mt-1 text-2xl">Hi, {me?.displayName.split(" ")[0]}</h1>
      <div className="mt-6">
        <Suspense fallback={<DashboardNav activePath={null} />}>
          <DashboardNavWithPath />
        </Suspense>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
