import "server-only";
import { browserApiBaseUrl } from "@/src/lib/devApiProxy";
import { getPortalBaseUrl } from "@/src/lib/portal";
import { readApiBaseUrl } from "@/src/lib/session";

export type BrowserApiConfig = {
  /** Where the browser calls the API (the dev proxy under `next dev`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

/**
 * What a page hands its client components so they can call the API from the browser, which
 * alone holds the API's `access_token` cookie. Call it after `requireProductAccess`.
 */
export async function readBrowserApiConfig(): Promise<BrowserApiConfig> {
  const apiBaseUrl = await readApiBaseUrl();
  return {
    apiBaseUrl: apiBaseUrl ? browserApiBaseUrl(apiBaseUrl, process.env.API_ALLOWED_URLS) : null,
    portalBaseUrl: getPortalBaseUrl(),
  };
}
