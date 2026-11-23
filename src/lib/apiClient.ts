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

/**
 * Query parameters. `undefined`, `null`, and empty values are left out; an array repeats the
 * key (`status=1&status=2`). The API rejects parameters its DTO doesn't declare (400).
 */
export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQuery = Record<string, ApiQueryValue | readonly ApiQueryValue[]>;

/** A JSON body, or `FormData` for routes that take files (the browser sets the boundary). */
export type ApiBody = unknown;

export function buildQueryString(query: ApiQuery): string {
  const search = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        search.append(key, String(value));
      }
    }
  }
  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
}

/** GETs `path` with `query` and resolves with the envelope's `result`; anything else throws an `ApiError`. */
export async function apiGet<T = unknown>(
  baseUrl: string,
  path: string,
  query: ApiQuery,
  options: ApiCallOptions,
): Promise<T> {
  return send<T>(`${baseUrl}${path}${buildQueryString(query)}`, "GET", undefined, options);
}

/** POSTs JSON (or `FormData`) and resolves with the envelope's `result`; anything else throws an `ApiError`. */
export async function apiPost<T = unknown>(
  baseUrl: string,
  path: string,
  body: ApiBody,
  options: ApiCallOptions,
): Promise<T> {
  return send<T>(`${baseUrl}${path}`, "POST", body, options);
}

/** PUTs JSON (or `FormData`) and resolves with the envelope's `result`. */
export async function apiPut<T = unknown>(
  baseUrl: string,
  path: string,
  body: ApiBody,
  options: ApiCallOptions,
): Promise<T> {
  return send<T>(`${baseUrl}${path}`, "PUT", body, options);
}

/** DELETEs `path`; some routes take a JSON body (e.g. a reason), others none. */
export async function apiDelete<T = unknown>(
  baseUrl: string,
  path: string,
  body: ApiBody | undefined,
  options: ApiCallOptions,
): Promise<T> {
  return send<T>(`${baseUrl}${path}`, "DELETE", body, options);
}

/** A file route (`is_excel=1` exports, import error reports): what to ask for, and a name to fall back on. */
export type DownloadRequest = { path: string; query: ApiQuery; fallbackName: string };

export type DownloadedFile = { blob: Blob; fileName: string };

/** The file name from `Content-Disposition` (the API exposes that header), else `fallback`. */
export function downloadFileName(contentDisposition: string | null, fallback: string): string {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const name = match?.[1]?.trim();
  if (!name) return fallback;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/**
 * GETs a file. These routes stream the file instead of the JSON envelope, so a plain link would
 * do, but it couldn't send the page's language (the API rejects an undeclared `lang` query
 * parameter) or show a refusal, which still comes back as the envelope and throws an `ApiError`.
 */
export async function apiDownload(
  baseUrl: string,
  { path, query, fallbackName }: DownloadRequest,
  { locale, fetchImpl = fetch }: ApiCallOptions,
): Promise<DownloadedFile> {
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}${buildQueryString(query)}`, {
      method: "GET",
      credentials: "include",
      headers: { "Accept-Language": locale, lang: locale },
    });
  } catch {
    throw new ApiError(0, null, null);
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!response.ok || contentType.includes("json")) {
    let status = response.ok ? 502 : response.status;
    let code: string | null = null;
    let message: string | null = null;
    try {
      const data: unknown = await response.json();
      if (isEnvelope(data)) {
        if (typeof data.statusCode === "number" && data.statusCode >= 400) status = data.statusCode;
        code = readString(data.result, "message_code");
        message = readString(data.result, "message");
      }
    } catch {
      // Not JSON: keep the HTTP status.
    }
    throw new ApiError(status, code, message);
  }

  return {
    blob: await response.blob(),
    fileName: downloadFileName(response.headers.get("Content-Disposition"), fallbackName),
  };
}

async function send<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: ApiBody | undefined,
  { locale, fetchImpl = fetch }: ApiCallOptions,
): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = method !== "GET" && body !== undefined;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method,
      credentials: "include",
      headers: {
        ...(hasBody && !isForm && { "Content-Type": "application/json" }),
        Accept: "application/json",
        "Accept-Language": locale,
        lang: locale,
      },
      ...(hasBody && { body: isForm ? (body as FormData) : JSON.stringify(body) }),
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
