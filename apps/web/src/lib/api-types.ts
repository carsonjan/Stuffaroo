/**
 * Response types for the Stuffaroo API. Mirrors docs/api-contract.md and the
 * FastAPI OpenAPI schema. Money is integer cents; IDs are UUID strings.
 */

import type { AvailabilityStatus, CategorySlug, Condition } from "./mock-data";

export type Profile = {
  id: string;
  displayName: string;
  campus: string | null;
  program: string | null;
  initials: string;
  joinedAt: string;
  completedLends: number;
};

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  pricePerDayCents: number | null;
  depositCents: number | null;
  location: string;
  availability: AvailabilityStatus;
  createdAt: string;
};

export type ListingDetail = Listing & { owner: Profile };

export type ProfileWithListings = {
  profile: Profile;
  listings: ListingDetail[];
};
