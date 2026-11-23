import { describe, expect, it, vi } from "vitest";
import { ApiError, apiDownload, downloadFileName } from "./apiClient";

const request = { path: "/customers", query: { project_id: 4, is_excel: 1, search: "" }, fallbackName: "customers.xlsx" };

describe("apiDownload", () => {
  it("asks for the file with the cookie and the page's language, and names it from the answer", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("sheet-bytes", {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="customers-2026-11-22.xlsx"',
        },
      }),
    );
    const file = await apiDownload("/api/dev-proxy/admin/0", request, { locale: "en", fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/dev-proxy/admin/0/customers?project_id=4&is_excel=1");
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({ lang: "en", "Accept-Language": "en" });
    expect(file.fileName).toBe("customers-2026-11-22.xlsx");
    expect(await file.blob.text()).toBe("sheet-bytes");
  });

  it("reads a refusal from the JSON envelope", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ result: { message: "Nope", message_code: "FORBIDDEN" }, success: false, statusCode: 403 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const error = await apiDownload("/b", request, { locale: "ar", fetchImpl }).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, code: "FORBIDDEN", serverMessage: "Nope" });
  });

  it("reports an unreachable API", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network");
    });
    await expect(apiDownload("/b", request, { locale: "en", fetchImpl })).rejects.toMatchObject({ status: 0 });
  });
});

describe("downloadFileName", () => {
  it("reads quoted, bare, and encoded names, else falls back", () => {
    expect(downloadFileName('attachment; filename="a.xlsx"', "x.xlsx")).toBe("a.xlsx");
    expect(downloadFileName("attachment; filename=b.xlsx", "x.xlsx")).toBe("b.xlsx");
    expect(downloadFileName("attachment; filename*=UTF-8''%D8%B9.xlsx", "x.xlsx")).toBe("ع.xlsx");
    expect(downloadFileName(null, "x.xlsx")).toBe("x.xlsx");
  });
});
