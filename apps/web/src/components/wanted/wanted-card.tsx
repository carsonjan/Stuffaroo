import { Calendar } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { WantedPost } from "@/lib/api-types";
import { getCategory } from "@/lib/categories";
import { formatDateRange, formatPriceCents } from "@/lib/format";

/**
 * A classmate's request, in the team's card style: what they need, when, their
 * budget, and an "I have this!" action. The title opens the post and its matches;
 * the button starts a listing. On your own posts (`own`) it opens the matches
 * instead, since offering your own request makes no sense.
 */
export function WantedCard({
  post,
  own = false,
}: {
  post: WantedPost;
  own?: boolean;
}) {
  const category = getCategory(post.category);

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
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-ink-3">
          {post.author.displayName.split(" ")[0]},{" "}
          {post.budgetPerDayCents === null
            ? "flexible budget"
            : `up to ${formatPriceCents(post.budgetPerDayCents)}`}
        </span>
        {own ? (
          <Link
            href={`/marketplace/wanted/${post.id}`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            See matches
          </Link>
        ) : (
          <Link
            href="/marketplace/listings/new"
            className={buttonVariants({ size: "lg" })}
          >
            I have this!
          </Link>
        )}
      </div>
    </article>
  );
}
