import type { Metadata } from "next";

import { ListingForm } from "@/components/listings/listing-form";

export const metadata: Metadata = { title: "Lend an item" };

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-10">
      <h1 className="text-2xl">Lend an item</h1>
      <p className="mt-1 text-muted-foreground">
        Describe it in a few words and let AI draft the listing. You review
        everything before it goes live.
      </p>
      <ListingForm />
    </div>
  );
}
