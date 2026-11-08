import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatDateRange } from "@/lib/format";
import {
  getCategory,
  getProfile,
  mockMatches,
  type WantedPost,
} from "@/lib/mock-data";

/**
 * A classmate's request, in the team's card style: what they need, when, their budget,
 * how many listings already match, and an "I have this!" action. The title opens the
 * post and its AI matches; the button starts a listing.
 */
export function WantedCard({ post }: { post: WantedPost }) {
  const author = getProfile(post.userId);
  const category = getCategory(post.category);
  const matchCount =
    mockMatches[post.id]?.filter((m) => m.score >= 0.7).length ?? 0;

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-[32px] bg-paper-2 p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <span className="rounded-pill bg-tint-mint px-2.5 py-0.5 font-medium text-ink">
          Wanted
        </span>
        {category?.name}
        <span className="ml-auto flex items-center gap-1">
          <Calendar className="size-3.5" aria-hidden />{" "}
          {formatDateRange(post.startDate, post.endDate)}
        </span>
      </div>
      <h3 className="text-xl leading-snug tracking-[-0.02em] text-ink">
        <Link
          href={`/marketplace/wanted/${post.id}`}
          className="rounded-small underline-offset-4 hover:underline"
        >
          {post.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm text-ink-3">{post.description}</p>
      <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
        <Sparkles className="size-3.5" aria-hidden />
        {matchCount > 0
          ? `${matchCount} ${matchCount === 1 ? "match" : "matches"} on campus`
          : "No matches yet"}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-ink-3">
          {author?.displayName.split(" ")[0]},{" "}
          {post.budgetPerDay === null
            ? "flexible budget"
            : `up to $${post.budgetPerDay}/day`}
        </span>
        <Link
          href="/marketplace/listings/new"
          className={buttonVariants({ size: "lg" })}
        >
          I have this!
        </Link>
      </div>
    </article>
  );
}
