import { NextResponse } from "next/server";

import { getAuth0 } from "./lib/auth0";

/**
 * Mounts the Auth0 routes (/auth/login, /auth/logout, /auth/callback, ...) and
 * keeps the session cookie rolling. Authorization is not decided here: pages and
 * actions re-check the session, and the API verifies the access token itself.
 */
export async function proxy(request: Request) {
  const auth0 = getAuth0();
  if (!auth0) return NextResponse.next();
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
