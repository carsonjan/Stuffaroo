import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ApiErrorState } from "@/components/api-error-state";
import { buttonVariants } from "@/components/ui/button";
import { WantedCard } from "@/components/wanted/wanted-card";
import { ApiError, getWantedPosts } from "@/lib/api";

export const metadata: Metadata = { title: "Wanted" };

const grid =
  "mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]";

export default function WantedPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="max-w-[16ch] text-display leading-[1.02] text-ink">
            Classmates are looking for
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-[1.65] text-ink-3">
            Have one of these? Lend it, rent it or sell it to them. Can&apos;t
            find something yourself? Ask, and we&apos;ll match it against what
            students have listed.
          </p>
        </div>
        <Link
          href="/marketplace/wanted/new"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus data-icon="inline-start" /> Post a request
        </Link>
      </div>

      <Suspense
        fallback={
          <div className={grid} aria-busy="true">
            <div className="h-56 animate-pulse rounded-[32px] bg-muted motion-reduce:animate-none" />
            <div className="h-56 animate-pulse rounded-[32px] bg-muted motion-reduce:animate-none" />
            <div className="h-56 animate-pulse rounded-[32px] bg-muted motion-reduce:animate-none" />
          </div>
        }
      >
        <OpenWantedPosts />
      </Suspense>
    </div>
  );
}

async function OpenWantedPosts() {
  try {
    const posts = await getWantedPosts();
    if (posts.length === 0) {
      return (
        <p className="mt-12 text-sm text-muted-foreground">
          No open requests right now.
        </p>
      );
    }
    return (
      <div className={grid}>
        {posts.map((post) => (
          <WantedCard key={post.id} post={post} />
        ))}
      </div>
    );
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="mt-12">
        <ApiErrorState detail={error.detail} />
      </div>
    );
  }
}
