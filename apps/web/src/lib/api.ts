/**
 * Server-side client for the Stuffaroo API (FastAPI in apps/api). Only import
 * this from server components and server actions: the base URL is server-only
 * config, and later auth headers carry the user's access token.
 */

import type { ListingDetail, ProfileWithListings } from "./api-types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

/** Status used when the API could not be reached at all. */
export const API_UNREACHABLE = 0;

type Query = Record<string, string | boolean | undefined>;

async function apiFetch<T>(path: string, query?: Query): Promise<T> {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(API_UNREACHABLE, "Couldn't reach the Stuffaroo API.");
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === "object" &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail;
      }
    } catch {
      // Keep the generic message when the error body isn't JSON.
    }
    throw new ApiError(response.status, detail);
  }
  return (await response.json()) as T;
}

export type ListingFilters = {
  q?: string;
  category?: string;
  price?: string;
  includeUnavailable?: boolean;
};

export function getListings(
  filters: ListingFilters = {},
): Promise<ListingDetail[]> {
  return apiFetch("/api/listings", {
    q: filters.q,
    category: filters.category,
    price: filters.price,
    include_unavailable: filters.includeUnavailable || undefined,
  });
}

/** Returns null for an unknown listing (404) so pages can call notFound(). */
export async function getListing(id: string): Promise<ListingDetail | null> {
  try {
    return await apiFetch<ListingDetail>(
      `/api/listings/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 422)
    )
      return null;
    throw error;
  }
}

export async function getProfileWithListings(
  id: string,
): Promise<ProfileWithListings | null> {
  try {
    return await apiFetch<ProfileWithListings>(
      `/api/profiles/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 422)
    )
      return null;
    throw error;
  }
}
