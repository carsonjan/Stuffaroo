import type { Metadata } from "next";
import { Suspense } from "react";

import { WantedForm } from "@/components/wanted/wanted-form";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Post a wanted" };

export default function NewWantedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-10">
      <h1 className="text-2xl">What do you need?</h1>
      <p className="mt-1 text-muted-foreground">
        Describe it in your own words. We&apos;ll show what students have
        already listed that fits, and you can post it so lenders can find you.
      </p>
      <Suspense
        fallback={
          <div
            className="mt-8 h-96 animate-pulse rounded-card bg-muted motion-reduce:animate-none"
            aria-busy="true"
          />
        }
      >
        <WantedFormForViewer />
      </Suspense>
    </div>
  );
}

async function WantedFormForViewer() {
  const viewer = await getViewer();
  return <WantedForm viewerStatus={viewer.status} />;
}
