import type { Metadata } from "next";
import { Suspense } from "react";

import { ListingForm } from "@/components/listings/listing-form";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Lend an item" };

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-10">
      <h1 className="text-2xl">Lend an item</h1>
      <p className="mt-1 text-muted-foreground">
        Describe your item, set a price or lend it for free, and publish. You
        review everything before it goes live.
      </p>
      <Suspense
        fallback={
          <div
            className="mt-8 h-96 animate-pulse rounded-card bg-muted motion-reduce:animate-none"
            aria-busy="true"
          />
        }
      >
        <ListingFormForViewer />
      </Suspense>
    </div>
  );
}

async function ListingFormForViewer() {
  const viewer = await getViewer();
  if (viewer.status !== "signed-in") {
    return (
      <SignInPrompt
        className="mt-8"
        status={viewer.status}
        returnTo="/marketplace/listings/new"
        title="Sign in to lend an item"
        description="Listings belong to your account, so you need to sign in before publishing one."
      />
    );
  }
  return <ListingForm />;
}
