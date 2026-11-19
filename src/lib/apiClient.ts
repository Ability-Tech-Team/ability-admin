/**
 * The browser's calls to the Community Admin API (`ability-crm-api/apps/community-admin`,
 * prefix `/admin`). `baseUrl` is what the layout hands the browser:
 * `browserApiBaseUrl(readApiBaseUrl(), API_ALLOWED_URLS)`, which is the dev proxy under
 * `next dev`. Calls carry the backend's HttpOnly `access_token` cookie
 * (`credentials: "include"`); this code never reads or stores a token.
 *
 * The API answers `{ result, success, statusCode }`, with HTTP 200 even for failures, so
 * the outcome is read from the body. Answers are classified by `statusCode` and
 * `message_code`, never by message text.
 */

export type ApiFailureKind =
  | "session_ended"
  | "password_change_required"
  | "too_many_attempts"
  | "unreachable"
  | "failed";

export class ApiError extends Error {
  /** The envelope's `statusCode`, else the HTTP status; 0 when the API couldn't be reached. */
  readonly status: number;
  readonly code: string | null;
  /** The API's own message, already in the request's language. */
  readonly serverMessage: string | null;
  readonly kind: ApiFailureKind;

  constructor(status: number, code: string | null, serverMessage: string | null) {
    super(serverMessage || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.serverMessage = serverMessage;
    this.kind = classifyFailure(status, code);
  }
}

export function classifyFailure(status: number, code: string | null): ApiFailureKind {
  if (status === 0) return "unreachable";
  if (status === 401) return "session_ended";
  if (status === 403 && code === "AUTH_PASSWORD_CHANGE_REQUIRED") {
    return "password_change_required";
  }
  if (status === 429 || code === "AUTH_TOO_MANY_ATTEMPTS") return "too_many_attempts";
  return "failed";
}

type Envelope = { result: unknown; success: unknown; statusCode: unknown };

function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "result" in value &&
    ("success" in value || "statusCode" in value)
  );
}

function readString(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null) return null;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" && field ? field : null;
}

export type ApiCallOptions = {
  /** The page's locale: the API answers in it and saves it with what it stores. */
  locale: string;
  /** Tests only. */
  fetchImpl?: typeof fetch;
};

/** POSTs JSON and resolves with the envelope's `result`; anything else throws an `ApiError`. */
export async function apiPost<T = unknown>(
  baseUrl: string,
  path: string,
  body: unknown,
  { locale, fetchImpl = fetch }: ApiCallOptions,
): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": locale,
        lang: locale,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, null, null);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Not JSON: the dev proxy's 404, an HTML error page from a proxy in front of the API.
  }

  if (!isEnvelope(data)) {
    throw new ApiError(response.ok ? 502 : response.status, null, null);
  }

  const statusCode =
    typeof data.statusCode === "number" ? data.statusCode : response.status;
  if (data.success === false || statusCode >= 400 || !response.ok) {
    throw new ApiError(
      statusCode >= 400 ? statusCode : response.status >= 400 ? response.status : 500,
      readString(data.result, "message_code"),
      readString(data.result, "message"),
    );
  }

  return data.result as T;
}
