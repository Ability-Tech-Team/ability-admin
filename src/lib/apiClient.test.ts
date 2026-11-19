import { describe, expect, it, vi } from "vitest";
import { ApiError, apiPost, classifyFailure } from "./apiClient";

const BASE = "/api/dev-proxy/admin/0";

function respond(body: unknown, init: { status?: number; json?: boolean } = {}) {
  const { status = 200, json = true } = init;
  return vi.fn(async () =>
    json
      ? new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      : new Response(String(body), { status, headers: { "Content-Type": "text/html" } }),
  );
}

async function failureOf(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => null,
    (err: unknown) => err,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe("apiPost", () => {
  it("sends JSON with the cookie and the page's language, and returns the result", async () => {
    const fetchImpl = respond({ result: { id: 1 }, success: true, statusCode: 201 });

    await expect(
      apiPost(BASE, "/support/requests", { subject: "Hi" }, { locale: "ar", fetchImpl }),
    ).resolves.toEqual({ id: 1 });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/support/requests`);
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify({ subject: "Hi" }));
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      lang: "ar",
      "Accept-Language": "ar",
    });
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("reads a failure from the body, since the API answers HTTP 200 for failures", async () => {
    const error = await failureOf(
      apiPost(BASE, "/support/requests", {}, {
        locale: "en",
        fetchImpl: respond({
          result: { message: "Not set up", message_code: "SUPPORT_NOT_CONFIGURED" },
          success: false,
          statusCode: 503,
        }),
      }),
    );
    expect(error.status).toBe(503);
    expect(error.code).toBe("SUPPORT_NOT_CONFIGURED");
    expect(error.serverMessage).toBe("Not set up");
    expect(error.kind).toBe("failed");
  });

  it("recognizes an ended session and throttling by status and code", async () => {
    const ended = await failureOf(
      apiPost(BASE, "/x", {}, {
        locale: "en",
        fetchImpl: respond({
          result: { message: "Unauthorized", message_code: "AUTH_INVALID_CREDENTIALS" },
          success: false,
          statusCode: 401,
        }),
      }),
    );
    expect(ended.kind).toBe("session_ended");

    const throttled = await failureOf(
      apiPost(BASE, "/x", {}, {
        locale: "en",
        fetchImpl: respond({
          result: { message: "Too many", message_code: "AUTH_TOO_MANY_ATTEMPTS" },
          success: false,
          statusCode: 429,
        }),
      }),
    );
    expect(throttled.kind).toBe("too_many_attempts");
  });

  it("fails an answer that isn't the envelope, such as an HTML error page", async () => {
    const html = await failureOf(
      apiPost(BASE, "/x", {}, {
        locale: "en",
        fetchImpl: respond("<html>Forbidden</html>", { status: 403, json: false }),
      }),
    );
    expect(html.status).toBe(403);
    expect(html.code).toBeNull();

    const notEnvelope = await failureOf(
      apiPost(BASE, "/x", {}, { locale: "en", fetchImpl: respond({ ok: true }) }),
    );
    expect(notEnvelope.status).toBe(502);
  });

  it("fails a success envelope that came with an error status", async () => {
    const error = await failureOf(
      apiPost(BASE, "/x", {}, {
        locale: "en",
        fetchImpl: respond({ result: {}, success: true, statusCode: 200 }, { status: 500 }),
      }),
    );
    expect(error.status).toBe(500);
  });

  it("reports an unreachable API without a status", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const error = await failureOf(apiPost(BASE, "/x", {}, { locale: "en", fetchImpl }));
    expect(error.status).toBe(0);
    expect(error.kind).toBe("unreachable");
  });
});

describe("classifyFailure", () => {
  it("names a password change only for the API's own code", () => {
    expect(classifyFailure(403, "AUTH_PASSWORD_CHANGE_REQUIRED")).toBe("password_change_required");
    expect(classifyFailure(403, "NO_PERMISSION")).toBe("failed");
    expect(classifyFailure(400, "INVALID_DATA_PROVIDED")).toBe("failed");
  });
});
