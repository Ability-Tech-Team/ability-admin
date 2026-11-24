import "server-only";
import { browserApiBaseUrl } from "@/src/lib/devApiProxy";
import { getPortalBaseUrl } from "@/src/lib/portal";
import { readApiBaseUrl, readSessionDetails } from "@/src/lib/session";
import type { SessionDetails } from "@/src/lib/sessionDetails";

export type BrowserApiConfig = {
  /** Where the browser calls the API (the dev proxy under `next dev`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  /** The project the user signed in to (forms save to it when the user can't pick a project). */
  sessionProject: SessionDetails["project"];
};

/**
 * What a page hands its client components so they can call the API from the browser, which
 * alone holds the API's `access_token` cookie. Call it after `requireProductAccess`.
 */
export async function readBrowserApiConfig(): Promise<BrowserApiConfig> {
  const [apiBaseUrl, session] = await Promise.all([readApiBaseUrl(), readSessionDetails()]);
  return {
    apiBaseUrl: apiBaseUrl ? browserApiBaseUrl(apiBaseUrl, process.env.API_ALLOWED_URLS) : null,
    portalBaseUrl: getPortalBaseUrl(),
    sessionProject: session?.project ?? null,
  };
}
