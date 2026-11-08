import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestRow } from "@/components/requests/request-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CURRENT_USER_ID,
  listings,
  type RentalRequest,
  rentalRequests,
} from "@/lib/mock-data";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage({
  searchParams,
}: PageProps<"/marketplace/dashboard/requests">) {
  return (
    <Suspense
      fallback={
        <div
          className="h-64 animate-pulse motion-reduce:animate-none rounded-card bg-muted"
          aria-busy="true"
        />
      }
    >
      <RequestTabs searchParams={searchParams} />
    </Suspense>
  );
}

async function RequestTabs({
  searchParams,
}: Pick<PageProps<"/marketplace/dashboard/requests">, "searchParams">) {
  const { tab } = await searchParams;
  const myListingIds = new Set(
    listings.filter((l) => l.ownerId === CURRENT_USER_ID).map((l) => l.id),
  );
  const incoming = rentalRequests.filter((r) => myListingIds.has(r.listingId));
  const outgoing = rentalRequests.filter(
    (r) => r.borrowerId === CURRENT_USER_ID,
  );

  return (
    <Tabs defaultValue={tab === "outgoing" ? "outgoing" : "incoming"}>
      <TabsList>
        <TabsTrigger value="incoming" className="px-3">
          Incoming ({incoming.length})
        </TabsTrigger>
        <TabsTrigger value="outgoing" className="px-3">
          My requests ({outgoing.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="incoming" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          People who want to borrow your items.
        </p>
        <RequestList requests={incoming} perspective="owner" />
      </TabsContent>
      <TabsContent value="outgoing" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Items you&apos;ve asked to borrow.
        </p>
        <RequestList requests={outgoing} perspective="borrower" />
      </TabsContent>
    </Tabs>
  );
}

function RequestList({
  requests,
  perspective,
}: {
  requests: RentalRequest[];
  perspective: "owner" | "borrower";
}) {
  if (requests.length === 0) {
    return (
      <p className="rounded-card border border-dashed p-8 text-center text-sm text-muted-foreground">
        No requests yet.
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-card border bg-card">
      {requests.map((r) => (
        <RequestRow key={r.id} request={r} perspective={perspective} />
      ))}
    </ul>
  );
}
