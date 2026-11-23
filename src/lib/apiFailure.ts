import { ApiError } from "@/src/lib/apiClient";
import { buildPortalSignInUrl } from "@/src/lib/portal";

/**
 * Why an API call failed, in the terms the screens show (`ApiFailureNotice`):
 * - `sessionEnded`: 401; `signInUrl` returns here after signing in on the Portal.
 * - `forbidden`: 403, e.g. a Super Admin-only route for another role.
 * - `passwordChange`: 403 `AUTH_PASSWORD_CHANGE_REQUIRED`.
 * - `tooMany`: 429 or `AUTH_TOO_MANY_ATTEMPTS`.
 * - `unreachable`: the API couldn't be reached.
 * - `rejected`: the API refused the request (400/404/409 ...); `message` is its own,
 *   already in the request's language.
 * - `failed`: anything else, including an answer without the expected shape.
 * - `noApi`: the sign-in names no API address this app trusts, so nothing was called.
 */
export type ApiFailure =
  | { reason: "sessionEnded"; signInUrl?: string }
  | { reason: "rejected"; status: number; code: string | null; message: string | null }
  | { reason: "forbidden" | "passwordChange" | "tooMany" | "unreachable" | "failed" | "noApi" };

export function toApiFailure(
  error: unknown,
  portalBaseUrl: string | null,
  locale: string,
): ApiFailure {
  if (!(error instanceof ApiError)) return { reason: "failed" };
  switch (error.kind) {
    case "session_ended":
      return {
        reason: "sessionEnded",
        signInUrl:
          portalBaseUrl && typeof window !== "undefined"
            ? buildPortalSignInUrl(portalBaseUrl, locale, window.location.href)
            : undefined,
      };
    case "password_change_required":
      return { reason: "passwordChange" };
    case "too_many_attempts":
      return { reason: "tooMany" };
    case "unreachable":
      return { reason: "unreachable" };
  }
  if (error.status === 403) return { reason: "forbidden" };
  if (error.status >= 400 && error.status < 500) {
    return { reason: "rejected", status: error.status, code: error.code, message: error.serverMessage };
  }
  return { reason: "failed" };
}
