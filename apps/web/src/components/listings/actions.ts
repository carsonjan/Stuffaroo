"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, createListing, describeApiError } from "@/lib/api";
import type { ListingInput } from "@/lib/api-types";
import {
  type CategorySlug,
  type Condition,
  categories,
} from "@/lib/categories";

export type CreateListingState =
  | { status: "idle" }
  | { status: "error"; message: string };

const conditions: Condition[] = ["New", "Like new", "Good", "Fair"];

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Whole dollars to cents, or null when the text isn't a whole number in range. */
function dollarsToCents(text: string, max: number): number | null {
  const dollars = Number(text);
  if (!Number.isInteger(dollars) || dollars < 0 || dollars > max) return null;
  return dollars * 100;
}

/** Validates the listing form, creates it through the API and opens it. */
export async function createListingAction(
  _previous: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const error = (message: string): CreateListingState => ({
    status: "error",
    message,
  });

  const title = field(formData, "title");
  if (title.length < 3 || title.length > 120) {
    return error("Give the item a title of 3 to 120 characters.");
  }
  const description = field(formData, "description");
  if (!description) return error("Add a short description.");
  if (description.length > 2000) {
    return error("Keep the description under 2,000 characters.");
  }

  const category = field(formData, "category");
  if (!categories.some((c) => c.slug === category)) {
    return error("Pick a category from the list.");
  }
  const condition = field(formData, "condition");
  if (!conditions.includes(condition as Condition)) {
    return error("Pick a condition from the list.");
  }

  let pricePerDayCents: number | null = null;
  if (field(formData, "pricing") !== "free") {
    const cents = dollarsToCents(field(formData, "pricePerDay"), 1000);
    if (cents === null || cents === 0) {
      return error(
        "Set a daily price between $1 and $1,000, or choose Lend for free.",
      );
    }
    pricePerDayCents = cents;
  }

  let depositCents: number | null = null;
  const deposit = field(formData, "deposit");
  if (deposit) {
    depositCents = dollarsToCents(deposit, 10_000);
    if (depositCents === null) {
      return error(
        "The deposit must be a whole number of dollars up to $10,000.",
      );
    }
  }

  const location = field(formData, "location");
  if (!location || location.length > 80) {
    return error("Pick a pickup area.");
  }

  const input: ListingInput = {
    title,
    description,
    category: category as CategorySlug,
    condition: condition as Condition,
    pricePerDayCents,
    depositCents,
    location,
  };

  let id: string;
  try {
    id = (await createListing(input)).id;
  } catch (caught) {
    if (caught instanceof ApiError) return error(describeApiError(caught));
    throw caught;
  }
  revalidatePath("/marketplace/dashboard", "layout");
  redirect(`/marketplace/listings/${id}`);
}
