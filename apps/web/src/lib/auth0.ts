/**
 * Auth0 for the Next.js app (SDK v4). Server-only.
 *
 * The client is created lazily and only when every variable below is set, so
 * the app still builds and runs before Auth0 credentials exist. In that state
 * the proxy passes requests through and the UI says sign-in isn't configured.
 */

import { Auth0Client } from "@auth0/nextjs-auth0/server";

const REQUIRED_ENV = [
  "AUTH0_DOMAIN",
  "AUTH0_CLIENT_ID",
  "AUTH0_CLIENT_SECRET",
  "AUTH0_SECRET",
  "APP_BASE_URL",
  "AUTH0_AUDIENCE",
] as const;

export function isAuthConfigured(): boolean {
  return REQUIRED_ENV.every((name) => Boolean(process.env[name]));
}

let client: Auth0Client | null = null;

export function getAuth0(): Auth0Client | null {
  if (!isAuthConfigured()) return null;
  client ??= new Auth0Client({
    authorizationParameters: {
      // The access token is issued for the Stuffaroo API, which verifies it.
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email",
    },
  });
  return client;
}
