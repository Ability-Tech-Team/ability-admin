import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { isLoopbackHost } from "./baseUrl";
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
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    requestHeaders.get("host") ??
    "localhost";
  const forwardedProto = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : isLoopbackHost(host.replace(/:\d+$/, ""))
        ? "http"
        : "https";

  return `${protocol}://${host}/${locale}`;
}
