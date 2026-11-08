import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { WantedCard } from "@/components/wanted/wanted-card";
import { wantedPosts } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Wanted" };

export default function WantedPage() {
  const open = wantedPosts.filter((p) => p.status === "open");

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

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {open.map((post) => (
          <WantedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
