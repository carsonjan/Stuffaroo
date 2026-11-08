import { BadgeCheck, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ApiErrorState } from "@/components/api-error-state";
import { ListingTile, RequestTile } from "@/components/ds/listing-tile";
import { ApiError, getProfileWithListings } from "@/lib/api";
import {
  loadProfile,
  type ProfileData,
  type ProfileTab,
  profileTabs,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/profile/[id]">): Promise<Metadata> {
  try {
    const data = await getProfileWithListings((await params).id);
    return { title: data?.profile.displayName ?? "Profile" };
  } catch {
    return { title: "Profile" };
  }
}

const joined = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const gridClass =
  "grid grid-cols-2 gap-x-3.5 gap-y-8 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4";

export default function ProfilePage({
  params,
  searchParams,
}: PageProps<"/marketplace/profile/[id]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileView params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container pt-6 md:pt-10" aria-busy="true">
      <div className="h-64 rounded-tile bg-surface" />
      <div className="mt-8 h-12 w-96 max-w-full rounded-pill bg-surface" />
    </div>
  );
}

async function ProfileView({
  params,
  searchParams,
}: PageProps<"/marketplace/profile/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  await connection();

  let data: ProfileData | null;
  try {
    data = await loadProfile(id, new Date());
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="container pt-10">
        <ApiErrorState detail={error.detail} />
      </div>
    );
  }
  if (!data) notFound();

  const counts: Record<ProfileTab, number> = {
    listings: data.forSale.length,
    rentals: data.forRent.length,
    requests: data.requests.length,
    reviews: data.reviews.length,
  };
  const raw = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  // Default to the first tab with something in it
  const tab: ProfileTab = profileTabs.some((t) => t.key === raw)
    ? (raw as ProfileTab)
    : (profileTabs.find((t) => counts[t.key] > 0)?.key ?? "listings");

  const { profile } = data;
  const firstName = profile.displayName.split(" ")[0];
  const href = (t: ProfileTab) => `/marketplace/profile/${profile.id}?tab=${t}`;

  return (
    <div className="container pt-6 md:pt-10">
      <Header data={data} />

      <nav
        aria-label="Profile sections"
        className="no-scrollbar -mx-[var(--gutter)] mt-8 overflow-x-auto px-[var(--gutter)] md:mt-10"
      >
        <ul className="flex w-max gap-1 rounded-pill bg-surface p-1">
          {profileTabs.map((t) => {
            const active = t.key === tab;
            return (
              <li key={t.key}>
                <Link
                  href={href(t.key)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "t-label flex h-10 items-center gap-1.5 rounded-pill px-4 transition-colors duration-200 md:px-5",
                    active
                      ? "bg-ink text-white"
                      : "text-ink hover:bg-surface-2",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "num font-normal",
                      active ? "text-white/70" : "text-ink-2",
                    )}
                  >
                    {counts[t.key]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section
        className="mt-8"
        aria-label={profileTabs.find((t) => t.key === tab)?.label}
      >
        {tab === "listings" &&
          (data.forSale.length ? (
            <ul className={gridClass}>
              {data.forSale.map((item) => (
                <li key={item.id}>
                  <ListingTile item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty text={`${firstName} isn’t selling anything right now.`} />
          ))}
        {tab === "rentals" &&
          (data.forRent.length ? (
            <ul className={gridClass}>
              {data.forRent.map((item) => (
                <li key={item.id}>
                  <ListingTile item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty text={`Nothing from ${firstName} to rent yet.`} />
          ))}
        {tab === "requests" &&
          (data.requests.length ? (
            <ul className={gridClass}>
              {data.requests.map((post) => (
                <li key={post.id}>
                  <RequestTile post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty text={`${firstName} isn’t asking for anything right now.`} />
          ))}
        {tab === "reviews" &&
          (data.reviews.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {data.reviews.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-card bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 items-center justify-center rounded-full bg-white text-[0.75rem] font-medium"
                      aria-hidden
                    >
                      {r.initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[0.9375rem]">{r.author}</span>
                      <span className="t-meta text-ink-2">
                        {r.item} ·{" "}
                        {r.daysAgo === 1
                          ? "1 day ago"
                          : `${r.daysAgo} days ago`}
                      </span>
                    </span>
                    <span
                      className="ml-auto flex"
                      role="img"
                      aria-label={`${r.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          // biome-ignore lint/suspicious/noArrayIndexKey: stars are positional
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < r.rating ? "fill-ink text-ink" : "text-ink-4",
                          )}
                          strokeWidth={i < r.rating ? 0 : 1.5}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </div>
                  <p className="t-body font-light">{r.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              text={`No reviews for ${firstName} yet. They appear after each handoff.`}
            />
          ))}
      </section>
    </div>
  );
}

function Header({ data }: { data: ProfileData }) {
  const { profile } = data;
  const stats: [string, string][] = [
    ["Rating", data.rating !== null ? `${data.rating.toFixed(1)} ★` : "New"],
    ["Handoffs", String(profile.completedLends + data.reviews.length)],
    ["Listed", String(data.forSale.length + data.forRent.length)],
    ["Replies", replyTime(data.responseTime)],
  ];
  const details = [profile.program, profile.campus ?? "UBC Vancouver"]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="grid grid-cols-[minmax(0,1fr)] gap-8 rounded-tile bg-surface p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span
          className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white text-[1.375rem] font-medium md:size-24"
          aria-hidden
        >
          {profile.initials}
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="t-statement max-w-none">{profile.displayName}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="t-label flex items-center gap-1 text-ok">
              <BadgeCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
              Verified UBC
            </span>
            <span className="text-[0.875rem] font-light text-ink-2">
              {details} · Joined {joined.format(new Date(profile.joinedAt))}
            </span>
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 md:gap-x-10">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="t-meta font-normal text-ink-2">{label}</dt>
            <dd className="t-h3 font-normal whitespace-nowrap">{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center rounded-tile bg-surface px-6 py-14 text-center">
      <p className="t-h3 font-normal">{text}</p>
      <Link
        href="/marketplace/browse"
        className="t-label mt-5 flex h-10 items-center rounded-pill border border-ink/20 px-5 transition-colors duration-200 hover:border-ink"
      >
        Browse campus
      </Link>
    </div>
  );
}

/** "Replies in about 1 hr" → "About 1 hr"; "Replies within a day" → "A day". */
function replyTime(text: string | null): string {
  if (!text) return "—";
  const rest = text.replace(/^Replies (in |within )?/, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}
