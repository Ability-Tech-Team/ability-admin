import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
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
 * This app's entry page for the locale, as the browser reached it. The Portal
 * validates the address against its configured product destinations.
 */
export async function entryUrl(locale: string): Promise<string> {
  return `${requestOrigin(await headers())}/${locale}`;
}
