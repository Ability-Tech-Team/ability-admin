import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { matchAllowedBaseUrl } from "./baseUrl";
import { requestOrigin } from "./portal";
import {
  parseSessionDetails,
  SESSION_DETAILS_COOKIE,
  type SessionDetails,
} from "./sessionDetails";

/** The signed-in user's details from the Portal's cookie (once per render). */
export const readSessionDetails = cache(
  async (): Promise<SessionDetails | null> =>
    parseSessionDetails((await cookies()).get(SESSION_DETAILS_COOKIE)?.value),
);

/**
 * The Community Admin API from the sign-in (`platforms[community-admin].apiUrl`),
 * or null when it isn't one of `API_ALLOWED_URLS`. A cookie that names any
 * other address is never followed, so a planted cookie can't send the user's
 * requests elsewhere. In the browser, call `browserApiBaseUrl` on it
 * (src/lib/devApiProxy.ts), which also covers local development.
 */
export async function readApiBaseUrl(): Promise<string | null> {
  const apiUrl = (await readSessionDetails())?.apiUrl;
  const apiBaseUrl = matchAllowedBaseUrl(apiUrl, process.env.API_ALLOWED_URLS, {
    allowPrivateNetworkHttp: true,
  });

  if (!apiBaseUrl && apiUrl) {
    console.warn(
      "The session names a Community Admin API that is not in API_ALLOWED_URLS.",
    );
  }

  return apiBaseUrl;
}

/**
 * This app's entry page for the locale, as the browser reached it. The Portal
 * validates the address against its configured product destinations.
 */
export async function entryUrl(locale: string): Promise<string> {
  return `${requestOrigin(await headers())}/${locale}`;
}
