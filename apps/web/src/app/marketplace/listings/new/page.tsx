import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { PostFlow } from "@/components/post/post-flow";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Post an item" };

export default function NewListingPage() {
  return (
    <div className="container pt-8 md:pt-14">
      <div className="mx-auto mb-8 max-w-[680px] text-center md:mb-10">
        <p className="t-label text-ink-2">Post an item</p>
        <h1 className="t-display mt-4">Pass it on</h1>
        <p className="t-body mx-auto mt-5 text-ink-2">
          Four quick steps: photos, details, price, pickup. Sell it, rent it out
          or lend it for free.
        </p>
      </div>
      <Suspense
        fallback={
          <div
            className="mx-auto h-[480px] max-w-[680px] rounded-tile bg-surface"
            aria-busy="true"
          />
        }
      >
        <PostFlowForViewer />
      </Suspense>
    </div>
  );
}

async function PostFlowForViewer() {
  await connection();
  const viewer = await getViewer();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PostFlow
      signedIn={viewer.status === "signed-in"}
      signInHref={
        viewer.status === "signed-out"
          ? `/auth/login?returnTo=${encodeURIComponent("/marketplace/listings/new")}`
          : null
      }
      today={today}
    />
  );
}
