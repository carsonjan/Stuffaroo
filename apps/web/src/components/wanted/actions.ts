"use server";

import { ApiError, findMatches } from "@/lib/api";
import type { MatchQuery, MatchResult } from "@/lib/api-types";
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
