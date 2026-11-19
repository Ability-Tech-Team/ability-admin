import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/src/lib/apiClient";
import { sendSupportRequest, toSentSupportRequest } from "./support";

const payload = {
  category: "account_access" as const,
  subject: "Cannot open notifications",
  message: "The notifications page stays empty.",
  page: "/notifications",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sending a support request", () => {
  it("posts to the Community Admin API and returns the reference and where the answer goes", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        result: {
          message: "تم إرسال طلبك إلى دعم Ability-Tech.",
          message_code: "SUPPORT_REQUEST_SENT_SUCCESSFULLY",
          request_id: 77,
          reference: "SR-ACME-77",
          reply_to: null,
        },
        success: true,
        statusCode: 201,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendSupportRequest("https://api.example.invalid/admin", payload, "ar")).resolves.toEqual({
      requestId: 77,
      reference: "SR-ACME-77",
      replyTo: null,
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.invalid/admin/support/requests");
    expect(JSON.parse(String(init.body))).toEqual(payload);
  });

  it("passes the API's failure on", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          result: { message: "Try again", message_code: "SUPPORT_REQUEST_NOT_SENT" },
          success: false,
          statusCode: 503,
        }),
      ),
    );

    const error = await sendSupportRequest("/api/dev-proxy/admin/0", payload, "en").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("SUPPORT_REQUEST_NOT_SENT");
  });
});

describe("the support request answer", () => {
  it("refuses an answer without a reference instead of showing an empty one", () => {
    expect(() => toSentSupportRequest({ request_id: 7 })).toThrow();
    expect(() => toSentSupportRequest(null)).toThrow();
  });
});
