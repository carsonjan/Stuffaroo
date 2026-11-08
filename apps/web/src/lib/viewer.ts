import { connection } from "next/server";
import { cache } from "react";

import { getMe } from "./api";
import type { Profile } from "./api-types";
import { getAuth0 } from "./auth0";

export type Viewer =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | {
      status: "signed-in";
      name: string;
      initials: string;
      /** Null if the API couldn't be reached; the session is still valid. */
      profile: Profile | null;
    };

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return letters.toUpperCase();
}

/** Who is looking at this request. Deduplicated per request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  // Always per request: whether Auth0 is configured is runtime config, and
  // must never be baked into a prerendered shell at build time.
  await connection();
  const auth0 = getAuth0();
  if (!auth0) return { status: "unconfigured" };
  const session = await auth0.getSession();
  if (!session) return { status: "signed-out" };

  let profile: Profile | null = null;
  try {
    profile = await getMe();
  } catch {
    profile = null;
  }
  const name =
    profile?.displayName ??
    session.user.name ??
    session.user.email ??
    "Student";
  return {
    status: "signed-in",
    name,
    initials: profile?.initials ?? initialsOf(name),
    profile,
  };
});

/** The signed-in user's profile id, or null. */
export async function getViewerProfileId(): Promise<string | null> {
  const viewer = await getViewer();
  return viewer.status === "signed-in" ? (viewer.profile?.id ?? null) : null;
}
