import { describe, expect, it, vi } from "vitest";
import { ApiError, apiDelete, apiPut, buildQueryString } from "./apiClient";
import { toApiFailure } from "./apiFailure";

const BASE = "/api/dev-proxy/admin/0";

function respond(body: unknown) {
  return vi.fn(async () =>
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }),
  );
}

describe("buildQueryString", () => {
  it("leaves out empty values and repeats array keys", () => {
    expect(buildQueryString({ page: 2, search: "", status: [1, 3], active: true, none: null })).toBe(
      "?page=2&status=1&status=3&active=true",
    );
    expect(buildQueryString({})).toBe("");
  });
});

describe("apiPut and apiDelete", () => {
  it("sends JSON with its content type", async () => {
    const fetchImpl = respond({ result: { id: 1 }, success: true, statusCode: 200 });
    await apiPut(BASE, "/customers/1", { name: "A" }, { locale: "en", fetchImpl });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/customers/1`);
    expect(init.method).toBe("PUT");
    expect(init.body).toBe(JSON.stringify({ name: "A" }));
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("sends FormData as it is, so the browser sets the multipart boundary", async () => {
    const fetchImpl = respond({ result: {}, success: true, statusCode: 200 });
    const form = new FormData();
    form.append("en_name", "Marina");
    await apiPut(BASE, "/projects/2", form, { locale: "en", fetchImpl });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.body).toBe(form);
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  it("sends DELETE without a body when there is none", async () => {
    const fetchImpl = respond({ result: {}, success: true, statusCode: 200 });
    await apiDelete(BASE, "/sub-projects/4", undefined, { locale: "en", fetchImpl });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
    expect(init.headers).not.toHaveProperty("Content-Type");
  });
});

describe("toApiFailure", () => {
  it("classifies by status and code", () => {
    expect(toApiFailure(new ApiError(401, null, null), null, "en")).toEqual({
      reason: "sessionEnded",
      signInUrl: undefined,
    });
    expect(toApiFailure(new ApiError(403, "AUTH_PASSWORD_CHANGE_REQUIRED", null), null, "en")).toEqual({
      reason: "passwordChange",
    });
    expect(toApiFailure(new ApiError(403, "FORBIDDEN", "No"), null, "en")).toEqual({ reason: "forbidden" });
    expect(toApiFailure(new ApiError(429, null, null), null, "en")).toEqual({ reason: "tooMany" });
    expect(toApiFailure(new ApiError(0, null, null), null, "en")).toEqual({ reason: "unreachable" });
    expect(toApiFailure(new ApiError(500, null, null), null, "en")).toEqual({ reason: "failed" });
    expect(toApiFailure(new Error("bad shape"), null, "en")).toEqual({ reason: "failed" });
  });

  it("keeps the API's own message for a refusal", () => {
    expect(toApiFailure(new ApiError(409, "EMAIL_EXISTS", "Email already used"), null, "en")).toEqual({
      reason: "rejected",
      status: 409,
      code: "EMAIL_EXISTS",
      message: "Email already used",
    });
  });
});
