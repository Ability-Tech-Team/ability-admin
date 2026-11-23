import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PhoneDirectoryAnswerError,
  buildPhoneContactBody,
  buildPhoneContactUpdateBody,
  createPhoneContact,
  deletePhoneContact,
  fetchPhoneDirectory,
  isValidPhoneNumber,
  phoneDirectoryQuery,
  toPhoneContact,
  toPhoneDirectoryPage,
  updatePhoneContact,
} from "./phoneDirectory";

// Shaped like ContentService.formatPhoneContact / getPhoneDirectory in
// ability-crm-api/apps/community-admin/src/content/content.service.ts.
const contact = {
  id: 5,
  project: { id: 1, name: "All Projects" },
  en_name: "Security Desk",
  ar_name: "مكتب الأمن",
  phone_number: "+97143456789",
  sort_order: 0,
  is_published: 0,
  published_at: null,
  created_at: "2026-11-19T09:00:00+02:00",
};

const adapted = {
  id: 5,
  projectId: 1,
  projectName: "All Projects",
  nameEn: "Security Desk",
  nameAr: "مكتب الأمن",
  phone: "+97143456789",
  sortOrder: 0,
  published: false,
  publishedAt: null,
  createdAt: "2026-11-19T09:00:00+02:00",
};

function stubFetch(result: unknown) {
  const fetchImpl = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => new Response(JSON.stringify({ result, success: true, statusCode: 200 })),
  );
  vi.stubGlobal("fetch", fetchImpl);
  return fetchImpl;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toPhoneContact", () => {
  it("adapts a contact", () => {
    expect(toPhoneContact(contact)).toEqual(adapted);
  });

  it("rejects a contact without a number", () => {
    expect(() => toPhoneContact({ ...contact, phone_number: null })).toThrow(PhoneDirectoryAnswerError);
  });
});

describe("toPhoneDirectoryPage", () => {
  it("adapts the list under phone_directory", () => {
    expect(toPhoneDirectoryPage({ total_count: 1, total_pages: 1, phone_directory: [contact] })).toEqual({
      totalCount: 1,
      totalPages: 1,
      contacts: [adapted],
    });
  });

  it("rejects an answer without phone_directory", () => {
    expect(() => toPhoneDirectoryPage({ total_count: 0, total_pages: 0, contacts: [] })).toThrow(
      PhoneDirectoryAnswerError,
    );
  });
});

describe("phoneDirectoryQuery and fetchPhoneDirectory", () => {
  it("maps the filter", () => {
    expect(phoneDirectoryQuery({ search: " 999 ", projectId: 3, published: true, page: 2, limit: 20 })).toEqual({
      search: "999",
      project_id: 3,
      is_published: 1,
      page: 2,
      limit: 20,
    });
  });

  it("calls GET /content/phone-directory", async () => {
    const fetchImpl = stubFetch({ total_count: 0, total_pages: 0, phone_directory: [] });
    await fetchPhoneDirectory("https://api.test/admin", { search: "desk", page: 1, limit: 20 }, "en");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/phone-directory?search=desk&page=1&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("phone numbers", () => {
  it("accepts what the DTO accepts once spaces and dashes are gone", () => {
    expect(isValidPhoneNumber("+971 4 345-6789")).toBe(true);
    expect(isValidPhoneNumber("999")).toBe(true);
    expect(isValidPhoneNumber("12")).toBe(false);
    expect(isValidPhoneNumber("+97 1x")).toBe(false);
  });
});

describe("request bodies and saves", () => {
  const input = { projectId: 3, nameEn: " FM ", nameAr: "الصيانة", phone: "+971 50 123-4567", published: true };

  it("builds CreatePhoneContactDto", () => {
    expect(buildPhoneContactBody(input)).toEqual({
      project_id: 3,
      en_name: "FM",
      ar_name: "الصيانة",
      phone_number: "+971501234567",
      is_published: 1,
    });
  });

  it("sends only the given fields on update", () => {
    expect(buildPhoneContactUpdateBody({ phone: "19 123" })).toEqual({ phone_number: "19123" });
  });

  it("POSTs, PUTs and DELETEs", async () => {
    const fetchImpl = stubFetch({ message: "Done", id: 9 });
    await expect(createPhoneContact("https://api.test/admin", input, "en")).resolves.toBe(9);
    await updatePhoneContact("https://api.test/admin", 9, { published: false }, "en");
    await deletePhoneContact("https://api.test/admin", 9, "en");
    expect(fetchImpl.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ["https://api.test/admin/content/phone-directory", "POST"],
      ["https://api.test/admin/content/phone-directory/9", "PUT"],
      ["https://api.test/admin/content/phone-directory/9", "DELETE"],
    ]);
  });
});
