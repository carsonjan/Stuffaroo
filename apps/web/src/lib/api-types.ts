/**
 * Response types for the Stuffaroo API. Mirrors docs/api-contract.md and the
 * FastAPI OpenAPI schema. Money is integer cents; IDs are UUID strings.
 */

import type { AvailabilityStatus, CategorySlug, Condition } from "./categories";

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

export type WantedPost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: CategorySlug;
  budgetPerDayCents: number | null;
  startDate: string;
  endDate: string;
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
  author: Profile;
};

export type Match = {
  listing: ListingDetail;
  /** 0..1, higher is closer. A relative ranking, not a probability. */
  score: number;
  reason: string;
};

export type MatchResult = {
  /** "keyword" means Gemini embeddings were unavailable for this request. */
  method: "vector" | "fulltext";
  matches: Match[];
};

export type MatchQuery = {
  text: string;
  category?: CategorySlug;
  budgetPerDayCents?: number;
  startDate?: string;
  endDate?: string;
};

export type RentalStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "active"
  | "completed";

export type RentalRequest = {
  id: string;
  listingId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  listing: ListingDetail;
  borrower: Profile;
};

/** accept/reject/start/complete are the owner's; cancel is the borrower's. */
export type RentalAction =
  | "accept"
  | "reject"
  | "cancel"
  | "start"
  | "complete";

/** owner = requests for my listings; borrower = requests I made. */
export type RentalRole = "owner" | "borrower";

export type ListingInput = {
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  /** null = free to borrow */
  pricePerDayCents: number | null;
  depositCents: number | null;
  location: string;
};

export type WantedInput = {
  title: string;
  description: string;
  category: CategorySlug;
  budgetPerDayCents: number | null;
  startDate: string;
  endDate: string;
};

export type RentalInput = {
  listingId: string;
  startDate: string;
  endDate: string;
  message: string;
};
