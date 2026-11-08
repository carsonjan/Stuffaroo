import type { Metadata } from "next";

import { WantedForm } from "@/components/wanted/wanted-form";

export const metadata: Metadata = { title: "Post a wanted" };

export default function NewWantedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-10">
      <h1 className="text-2xl">What do you need?</h1>
      <p className="mt-1 text-muted-foreground">
        Write it like you&apos;d text a friend. We&apos;ll pull out the details
        and show what&apos;s already available.
      </p>
      <WantedForm />
    </div>
  );
}
