import "server-only";
import { redirect } from "next/navigation";
import { buildPortalSignInUrl, getPortalBaseUrl } from "./portal";
import { entryUrl, readSessionDetails } from "./session";
import { includesCommunityAdminPlatform } from "./sessionDetails";

/** Who is signed in, for display. */
export type SessionAccount = { name: string; roleName: string | null };

export type ProductAccess =
  | { status: "available"; account: SessionAccount }
  /** The sign-in doesn't list `community-admin`. */
  | { status: "denied"; account: SessionAccount }
  /** Signed out, but the Portal's address isn't configured: never show the product. */
  | { status: "sign-in-unavailable" };

/**
 * The access check that every protected page runs first. Signed-out users go
 * to the Portal's sign-in page and come back to this locale's entry page.
 * Until this app has its API, the Portal's cookie is its only check: the
 * sign-in must list `community-admin`.
 */
export async function requireProductAccess(
  locale: string,
): Promise<ProductAccess> {
  const details = await readSessionDetails();

  if (!details) {
    const portalBaseUrl = getPortalBaseUrl();

    if (!portalBaseUrl) {
      return { status: "sign-in-unavailable" };
    }

    redirect(buildPortalSignInUrl(portalBaseUrl, locale, await entryUrl(locale)));
  }

  const account = {
    name: details.fullName ?? details.userName,
    roleName: details.roleName,
  };

  return includesCommunityAdminPlatform(details)
    ? { status: "available", account }
    : { status: "denied", account };
}
