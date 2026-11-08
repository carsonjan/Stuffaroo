/**
 * Server-side client for the Stuffaroo API (FastAPI in apps/api). Only import
 * this from server components and server actions: the base URL is server-only
 * config, and authenticated calls carry the user's Auth0 access token.
 */

import type {
  ListingDetail,
  ListingInput,
  MatchQuery,
  MatchResult,
  Profile,
  ProfileWithListings,
  RentalAction,
  RentalInput,
  RentalRequest,
  RentalRole,
  WantedInput,
  WantedPost,
} from "./api-types";
import { getAuth0 } from "./auth0";

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

type FetchOptions = {
  query?: Query;
  method?: "GET" | "POST";
  body?: unknown;
  /** Send the signed-in user's access token. */
  auth?: boolean;
};

/** The current user's Auth0 access token for the API. */
async function accessToken(): Promise<string> {
  const auth0 = getAuth0();
  if (!auth0) throw new ApiError(503, "Sign-in isn't configured yet.");
  try {
    const { token } = await auth0.getAccessToken();
    return token;
  } catch {
    throw new ApiError(401, "Sign in required");
  }
}

async function apiFetch<T>(
  path: string,
  { query, method = "GET", body, auth = false }: FetchOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (auth) headers.set("Authorization", `Bearer ${await accessToken()}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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
    query: {
      q: filters.q,
      category: filters.category,
      price: filters.price,
      include_unavailable: filters.includeUnavailable || undefined,
    },
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

export function getWantedPosts(): Promise<WantedPost[]> {
  return apiFetch("/api/wanted");
}

export async function getWantedPost(id: string): Promise<WantedPost | null> {
  try {
    return await apiFetch<WantedPost>(`/api/wanted/${encodeURIComponent(id)}`);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 422)
    )
      return null;
    throw error;
  }
}

export function getWantedMatches(id: string): Promise<MatchResult> {
  return apiFetch(`/api/wanted/${encodeURIComponent(id)}/matches`);
}

export function findMatches(query: MatchQuery): Promise<MatchResult> {
  return apiFetch("/api/matches", { method: "POST", body: query });
}

/** The signed-in user's profile, or null when signed out or sign-in is off. */
export async function getMe(): Promise<Profile | null> {
  try {
    return await apiFetch<Profile>("/api/me", { auth: true });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 503)
    )
      return null;
    throw error;
  }
}

/** User-facing text for a failed write, for server actions to show inline. */
export function describeApiError(error: ApiError): string {
  if (error.status === 401) return "Your session has expired. Sign in again.";
  if (error.status === 422)
    return "Some details weren't accepted. Check the form and try again.";
  return error.detail;
}

export function createListing(input: ListingInput): Promise<ListingDetail> {
  return apiFetch("/api/listings", { method: "POST", body: input, auth: true });
}

export function getMyListings(): Promise<ListingDetail[]> {
  return apiFetch("/api/me/listings", { auth: true });
}

export function createWanted(input: WantedInput): Promise<WantedPost> {
  return apiFetch("/api/wanted", { method: "POST", body: input, auth: true });
}

export function getMyWanted(): Promise<WantedPost[]> {
  return apiFetch("/api/me/wanted", { auth: true });
}

export function createRental(input: RentalInput): Promise<RentalRequest> {
  return apiFetch("/api/rentals", { method: "POST", body: input, auth: true });
}

/** owner = incoming requests for my listings; borrower = requests I made. */
export function getRentals(role: RentalRole): Promise<RentalRequest[]> {
  return apiFetch("/api/rentals", { query: { role }, auth: true });
}

/** Returns null when the request doesn't exist or isn't yours (404). */
export async function getRental(id: string): Promise<RentalRequest | null> {
  try {
    return await apiFetch<RentalRequest>(
      `/api/rentals/${encodeURIComponent(id)}`,
      { auth: true },
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

export function transitionRental(
  id: string,
  action: RentalAction,
): Promise<RentalRequest> {
  return apiFetch(`/api/rentals/${encodeURIComponent(id)}/transition`, {
    method: "POST",
    body: { action },
    auth: true,
  });
}
