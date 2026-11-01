import { z } from "zod";

/**
 * The `ability_portal_session` cookie: the sign-in answer of the portal
 * backend (`POST /api/auth/login`), which Ability Portal stores for the
 * products because only the Portal receives that answer. Value: base64url of
 * `{ "session": {...}, "client": {...}, "platforms": [...] }`. The rules match
 * the Portal's (`Ability-Portal/src/lib/signInAnswer.ts`), so a cookie the
 * Portal writes always reads here.
 *
 * It is display data (who is signed in) and the list of products the user
 * may open; this app has no API yet, so it is also its only access check.
 */
export const SESSION_DETAILS_COOKIE = "ability_portal_session";

/** This app's key in the session's `platforms`. */
export const COMMUNITY_ADMIN_PLATFORM = "community-admin";

/** Cookies are capped at 4 KB; anything longer is not this cookie. */
const MAX_COOKIE_LENGTH = 4096;

const id = z.union([z.string().min(1), z.number()]);
const optionalText = z.string().nullish();

const sessionSchema = z.object({
  employee_id: id,
  user_name: z.string(),
  employee_name: optionalText,
  role_id: id.nullish(),
  role_name: optionalText,
  department_id: id.nullish(),
  company_project_id: id.nullish(),
  company_code: optionalText,
  project_code: optionalText,
  project_name: optionalText,
  employee_type_id: id.nullish(),
  employee_type_name: optionalText,
  safe_id: z.number().nullish(),
  safe_name: optionalText,
  platforms: z.array(z.string()).nullish(),
});

const cookieSchema = z.object({ session: sessionSchema });

export type SessionDetails = {
  userName: string;
  fullName: string | null;
  roleName: string | null;
  /** Null when the session doesn't list platforms. */
  platforms: string[] | null;
};

function decodeBase64Url(value: string): string | null {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(value)) {
    return null;
  }

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/** The cookie's details, or null when it is missing or not in this format. */
export function parseSessionDetails(
  raw: string | undefined | null,
): SessionDetails | null {
  if (!raw || raw.length > MAX_COOKIE_LENGTH) {
    return null;
  }

  const json = decodeBase64Url(raw);

  if (json === null) {
    return null;
  }

  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }

  const parsed = cookieSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const { session } = parsed.data;

  return {
    userName: session.user_name,
    fullName: session.employee_name?.trim() || null,
    roleName: session.role_name?.trim() || null,
    platforms: session.platforms ?? null,
  };
}

/**
 * Whether the session lists this app. A session without the list, or
 * without `community-admin` in it, never opens the app.
 */
export function includesCommunityAdminPlatform(details: SessionDetails): boolean {
  return details.platforms?.includes(COMMUNITY_ADMIN_PLATFORM) ?? false;
}
