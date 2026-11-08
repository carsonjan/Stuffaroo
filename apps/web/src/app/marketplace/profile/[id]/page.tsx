import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiErrorState } from "@/components/api-error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError, getProfileWithListings } from "@/lib/api";
import type { ProfileWithListings } from "@/lib/api-types";

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

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function ProfilePage({
  params,
}: PageProps<"/marketplace/profile/[id]">) {
  const { id } = await params;
  let data: ProfileWithListings | null;
  try {
    data = await getProfileWithListings(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10">
        <ApiErrorState detail={error.detail} />
      </div>
    );
  }
  if (!data) notFound();
  const { profile, listings } = data;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10">
      <div className="flex flex-col gap-6 rounded-card border bg-card p-6 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          <AvatarFallback className="bg-paper-3 font-display text-2xl text-ink-2">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
          {profile.program && (
            <p className="mt-1 text-muted-foreground">{profile.program}</p>
          )}
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {profile.campus ? `${profile.campus}, joined` : "Joined"}{" "}
            {joinedFormatter.format(new Date(profile.joinedAt))}
          </p>
        </div>
        <dl>
          <dt className="text-xs text-muted-foreground">Completed lends</dt>
          <dd className="mt-1 font-display text-2xl">
            {profile.completedLends}
          </dd>
        </dl>
      </div>

      <h2 className="mt-12 mb-6 text-xl font-semibold">
        Listings from {profile.displayName.split(" ")[0]}
      </h2>
      {listings.length > 0 ? (
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No listings yet.</p>
      )}
    </div>
  );
}
