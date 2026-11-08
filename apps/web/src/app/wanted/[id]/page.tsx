import { Calendar, Megaphone, PackageOpen, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { MatchList } from "@/components/wanted/match-list";
import { formatDateRange } from "@/lib/format";
import {
  CURRENT_USER_ID,
  getCategory,
  getProfile,
  getWantedPost,
  mockMatches,
  wantedPosts,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return wantedPosts.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/wanted/[id]">): Promise<Metadata> {
  const post = getWantedPost((await params).id);
  return { title: post?.title ?? "Wanted" };
}

export default async function WantedDetailPage({
  params,
}: PageProps<"/wanted/[id]">) {
  const { id } = await params;
  const post = getWantedPost(id);
  if (!post) notFound();

  const author = getProfile(post.userId);
  const category = getCategory(post.category);
  const matches = [...(mockMatches[post.id] ?? [])].sort(
    (a, b) => b.score - a.score,
  );
  const isOwn = post.userId === CURRENT_USER_ID;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-10">
      <Link
        href="/wanted"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        All wanted posts
      </Link>

      <article className="mt-6 rounded-card border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-pill bg-paper-3 text-ink-2">
            <Megaphone className="size-4" aria-hidden />
          </span>
          <div className="text-sm">
            <p className="font-medium">
              {author?.displayName}
              {isOwn && " (you)"}
            </p>
            <p className="text-muted-foreground">
              {author?.campus}, {category?.name}
            </p>
          </div>
        </div>
        <h1 className="mt-5 text-2xl">{post.title}</h1>
        <p className="mt-3 text-muted-foreground">{post.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-small bg-muted px-3 py-1.5">
            <Calendar className="size-4 text-muted-foreground" aria-hidden />{" "}
            {formatDateRange(post.startDate, post.endDate)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-small bg-muted px-3 py-1.5">
            <Wallet className="size-4 text-muted-foreground" aria-hidden />
            {post.budgetPerDay === null
              ? "Flexible budget"
              : `Up to $${post.budgetPerDay}/day`}
          </span>
        </div>
        {!isOwn && (
          <div className="mt-6 flex items-center gap-3 border-t pt-5">
            {author && (
              <Avatar>
                <AvatarFallback className="bg-paper-3 text-xs text-ink-2">
                  {author.initials}
                </AvatarFallback>
              </Avatar>
            )}
            <p className="flex-1 text-sm text-muted-foreground">
              Have one of these? List it and {author?.displayName.split(" ")[0]}{" "}
              will see it.
            </p>
            <Link
              href="/listings/new"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-3.5",
              )}
            >
              I have one
            </Link>
          </div>
        )}
      </article>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Suggested matches</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by relevance, category, availability for these dates, price
              and pickup location.
            </p>
          </div>
          <span className="shrink-0 rounded-pill border px-2.5 py-0.5 text-xs text-muted-foreground">
            AI-ranked sample output
          </span>
        </div>
        {matches.length > 0 ? (
          <MatchList matches={matches} />
        ) : (
          <div className="flex flex-col items-center rounded-card border border-dashed px-6 py-14 text-center">
            <PackageOpen className="size-8 text-muted-foreground" aria-hidden />
            <p className="mt-4 font-medium">No listings match yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Nothing in the sample data fits this post yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
