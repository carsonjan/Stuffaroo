import { Suspense } from "react";

import {
  DashboardNav,
  DashboardNavWithPath,
} from "@/components/dashboard/dashboard-nav";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { getViewer } from "@/lib/viewer";

export default function DashboardLayout({
  children,
}: LayoutProps<"/marketplace/dashboard">) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10">
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting />
      </Suspense>
      <div className="mt-6">
        <Suspense fallback={<DashboardNav activePath={null} />}>
          <DashboardNavWithPath />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <SignedInOnly>{children}</SignedInOnly>
        </Suspense>
      </div>
    </div>
  );
}

function GreetingSkeleton() {
  return (
    <div aria-busy="true">
      <div className="h-5 w-28 animate-pulse rounded-small bg-muted motion-reduce:animate-none" />
      <div className="mt-1 h-9 w-48 animate-pulse rounded-small bg-muted motion-reduce:animate-none" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="h-64 animate-pulse rounded-card bg-muted motion-reduce:animate-none"
      aria-busy="true"
    />
  );
}

async function Greeting() {
  const viewer = await getViewer();
  if (viewer.status !== "signed-in") {
    return <h1 className="text-2xl">Dashboard</h1>;
  }
  return (
    <>
      {viewer.profile?.campus && (
        <p className="text-sm text-muted-foreground">{viewer.profile.campus}</p>
      )}
      <h1 className="mt-1 text-2xl">Hi, {viewer.name.split(" ")[0]}</h1>
    </>
  );
}

/** Dashboard pages read the signed-in user's data, so they need a session. */
async function SignedInOnly({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.status !== "signed-in") {
    return (
      <SignInPrompt
        status={viewer.status}
        returnTo="/marketplace/dashboard"
        title="Sign in to see your dashboard"
        description="Your listings, wanted posts and rental requests show here once you sign in."
      />
    );
  }
  return children;
}
