"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ApiError,
  createWanted,
  describeApiError,
  findMatches,
} from "@/lib/api";
import type { MatchQuery, MatchResult, WantedInput } from "@/lib/api-types";
import { type CategorySlug, categories } from "@/lib/mock-data";

export type FindMatchesState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; result: MatchResult };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Validates the need form and asks the API for matching listings. */
export async function findMatchesAction(
  _previous: FindMatchesState,
  formData: FormData,
): Promise<FindMatchesState> {
  const text = field(formData, "text");
  if (text.length < 3) {
    return { status: "error", message: "Describe what you need first." };
  }
  const query: MatchQuery = { text: text.slice(0, 1000) };

  const category = field(formData, "category");
  if (category) {
    if (!categories.some((c) => c.slug === category)) {
      return { status: "error", message: "Pick a category from the list." };
    }
    query.category = category as CategorySlug;
  }

  const budget = field(formData, "budget");
  if (budget) {
    const dollars = Number(budget);
    if (!Number.isInteger(dollars) || dollars < 0) {
      return {
        status: "error",
        message: "Budget must be a whole number of dollars.",
      };
    }
    query.budgetPerDayCents = dollars * 100;
  }

  const startDate = field(formData, "startDate");
  const endDate = field(formData, "endDate");
  if (startDate || endDate) {
    if (!startDate || !endDate) {
      return {
        status: "error",
        message: "Give both dates, or leave both empty.",
      };
    }
    if (endDate < startDate) {
      return {
        status: "error",
        message: "The end date is before the start date.",
      };
    }
    query.startDate = startDate;
    query.endDate = endDate;
  }

  try {
    return { status: "done", result: await findMatches(query) };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.detail };
    }
    throw error;
  }
}

export type PostWantedState =
  | { status: "idle" }
  | { status: "error"; message: string };

/** Validates the form for posting (title, category and dates required), saves it and opens it. */
export async function postWantedAction(
  _previous: PostWantedState,
  formData: FormData,
): Promise<PostWantedState> {
  const error = (message: string): PostWantedState => ({
    status: "error",
    message,
  });

  const title = field(formData, "title");
  if (title.length < 3 || title.length > 120) {
    return error("Add a title of 3 to 120 characters to post.");
  }
  const description = field(formData, "text");
  if (description.length < 3) return error("Describe what you need first.");
  if (description.length > 2000) {
    return error("Keep the description under 2,000 characters.");
  }

  const category = field(formData, "category");
  if (!categories.some((c) => c.slug === category)) {
    return error("Pick a category to post.");
  }

  let budgetPerDayCents: number | null = null;
  const budget = field(formData, "budget");
  if (budget) {
    const dollars = Number(budget);
    if (!Number.isInteger(dollars) || dollars < 0 || dollars > 1000) {
      return error("Budget must be a whole number of dollars up to $1,000.");
    }
    budgetPerDayCents = dollars * 100;
  }

  const startDate = field(formData, "startDate");
  const endDate = field(formData, "endDate");
  if (!startDate || !endDate) return error("Add both dates to post.");
  if (endDate < startDate) {
    return error("The end date is before the start date.");
  }

  const input: WantedInput = {
    title,
    description,
    category: category as CategorySlug,
    budgetPerDayCents,
    startDate,
    endDate,
  };

  let id: string;
  try {
    id = (await createWanted(input)).id;
  } catch (caught) {
    if (caught instanceof ApiError) return error(describeApiError(caught));
    throw caught;
  }
  revalidatePath("/marketplace/wanted");
  revalidatePath("/marketplace/dashboard", "layout");
  redirect(`/marketplace/wanted/${id}`);
}
