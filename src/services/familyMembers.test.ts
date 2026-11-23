import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQueryString } from "@/src/lib/apiClient";
import {
  acceptFamilyMember,
  familyMembersSheetRequest,
  familyMembersQuery,
  FamilyMembersAnswerError,
  fetchFamilyMembers,
  rejectFamilyMember,
  revertFamilyMember,
  toFamilyMembersPage,
  type FamilyMemberFilters,
} from "./familyMembers";

// Answers shaped like `searchOwnerRelativeRequests` in
// libs/domain/src/customers/customer-shared.service.ts, with the payload the community app
// stores (apps/community-api/src/relatives/relatives.service.ts).

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: 51,
    unit_id: 301,
    unit_number: "A-301",
    project_id: 4,
    owner_id: 17,
    relative_identification_id: "31505221234567",
    payload: {
      unit_code: "A-301",
      owner_id: "17",
      project: 4,
      first_name: "Omar",
      last_name: "Al Rashidi",
      phone: "201112223344",
      gender: "male",
      relation: "Son ",
      national_id_image: "client/projects/P1/4/relative-requests/u/nid.jpg",
      identification_type: "NATIONAL_ID",
      identification_value: "31505221234567",
      identification_images: ["client/projects/P1/4/relative-requests/u/nid.jpg", "client/projects/P1/4/relative-requests/u/extra.jpg"],
    },
    request_status_id: 1,
    reject_reason: null,
    request_from_id: 2,
    is_active: 1,
    is_deleted: 0,
    created_by: null,
    updated_by: null,
    created_at: "2026-11-20, 09:15",
    updated_at: null,
    status: { id: 1, name: "Pending", en_name: "Pending", ar_name: "قيد الانتظار" },
    owner: { id: 17, customer_name: "Ahmed Al Rashidi", customer_code: "C001", id_number: "29801011234567" },
    unit: { id: 301, unit_number: "A-301" },
    profile_image: null,
    // MediaUrlInterceptor has swapped the keys for signed links by now.
    national_id_image: { file_path: "https://media.example/signed/nid.jpg" },
    identification_images: [
      { file_path: "https://media.example/signed/nid.jpg" },
      { file_path: "https://media.example/signed/extra.jpg" },
    ],
    action_by: null,
    action_by_id: null,
    description: "Owner relative request created by Ahmed Al Rashidi from the community app on unit A-301",
    owner_relatives_request_logs: [],
    ...overrides,
  };
}

const filters: FamilyMemberFilters = { search: "", searchField: "unit", status: null, projectId: null };

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(result: unknown) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ result, success: true, statusCode: 200 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return () => fetchMock.mock.calls[0] as unknown as [string, RequestInit];
}

describe("toFamilyMembersPage", () => {
  it("adapts a request and its payload", () => {
    const page = toFamilyMembersPage({ totalCount: 1, totalPages: 1, requests: [request()] });
    expect(page).toMatchObject({ totalCount: 1, totalPages: 1 });
    expect(page.requests[0]).toEqual({
      id: 51,
      projectId: 4,
      name: "Omar Al Rashidi",
      ownerId: 17,
      ownerName: "Ahmed Al Rashidi",
      idType: "id",
      idNumber: "31505221234567",
      unitNumber: "A-301",
      relationship: "Son",
      mobile: "201112223344",
      email: null,
      status: "pending",
      statusName: "Pending",
      rejectReason: null,
      actionBy: null,
      createdAt: "2026-11-20, 09:15",
      attachments: [
        { kind: "nationalIdImage", url: "https://media.example/signed/nid.jpg" },
        { kind: "idImage", url: "https://media.example/signed/extra.jpg" },
      ],
    });
  });

  it("maps the statuses and a passport, and survives an unexpected payload", () => {
    const page = toFamilyMembersPage({
      totalCount: 3,
      totalPages: 1,
      requests: [
        request({ status: { id: 2, name: "Accept" }, payload: { ...request().payload, identification_type: "passport" } }),
        request({ id: 52, status: { id: 3, name: "Reject" }, reject_reason: "Wrong unit", action_by: "Admin" }),
        request({ id: 53, status: { id: 9, name: "Other" }, payload: "not an object", profile_image: { file_path: "https://media.example/p.jpg" } }),
      ],
    });
    expect(page.requests[0]).toMatchObject({ status: "approved", idType: "passport" });
    expect(page.requests[1]).toMatchObject({ status: "rejected", rejectReason: "Wrong unit", actionBy: "Admin" });
    expect(page.requests[2]).toMatchObject({ status: null, statusName: "Other", name: "", idType: null, relationship: null });
    expect(page.requests[2].attachments[0]).toEqual({ kind: "profileImage", url: "https://media.example/p.jpg" });
  });

  it("rejects the snake_case totals the other lists use", () => {
    expect(() => toFamilyMembersPage({ total_count: 1, total_pages: 1, requests: [] })).toThrow(FamilyMembersAnswerError);
    expect(() =>
      toFamilyMembersPage({ totalCount: 1, totalPages: 1, requests: [{ ...request(), relative_identification_id: undefined }] }),
    ).toThrow(FamilyMembersAnswerError);
  });
});

describe("familyMembersQuery", () => {
  it("sends the search in the chosen field, the status id and the project", () => {
    expect(buildQueryString(familyMembersQuery({ ...filters, search: " A-3 " }))).toBe("?unit_number=A-3");
    expect(buildQueryString(familyMembersQuery({ ...filters, search: "0100", searchField: "ownerMobile" }))).toBe("?mobile_number=0100");
    expect(buildQueryString(familyMembersQuery({ ...filters, search: "315", searchField: "relativeId" }))).toBe(
      "?relative_identification_id=315",
    );
    expect(buildQueryString(familyMembersQuery({ ...filters, status: "rejected", projectId: 4 }))).toBe(
      "?request_status_id=3&project_id=4",
    );
    expect(buildQueryString(familyMembersQuery(filters))).toBe("");
  });

  it("builds the export link", () => {
    const request = familyMembersSheetRequest({ ...filters, status: "pending" });
    expect(request.path + buildQueryString(request.query)).toBe(
      "/customers/owner-relative-requests?request_status_id=1&is_excel=1",
    );
  });
});

describe("family member requests", () => {
  const BASE = "/api/dev-proxy/admin/0";

  it("asks for one page", async () => {
    const call = stubFetch({ totalCount: 0, totalPages: 0, requests: [] });
    await fetchFamilyMembers(BASE, { ...filters, status: "pending" }, 2, "en");
    expect(call()[0]).toBe(`${BASE}/customers/owner-relative-requests?request_status_id=1&page=2&limit=20`);
  });

  it("accepts and reverts without a body", async () => {
    let call = stubFetch({ message: "OK" });
    await acceptFamilyMember(BASE, 51, "en");
    expect(call()[0]).toBe(`${BASE}/customers/owner-relative-requests/51/accept`);
    expect(call()[1].method).toBe("POST");
    expect(call()[1]).not.toHaveProperty("body");

    call = stubFetch({ message: "OK" });
    await revertFamilyMember(BASE, 51, "en");
    expect(call()[0]).toBe(`${BASE}/customers/owner-relative-requests/51/revert-accept`);
  });

  it("rejects with the reason only when one was given", async () => {
    let call = stubFetch({ message: "OK", request_id: 51 });
    await rejectFamilyMember(BASE, 51, "  Wrong unit ", "en");
    expect(call()[0]).toBe(`${BASE}/customers/owner-relative-requests/51/reject`);
    expect(JSON.parse(String(call()[1].body))).toEqual({ reason: "Wrong unit" });

    call = stubFetch({ message: "OK", request_id: 51 });
    await rejectFamilyMember(BASE, 51, "  ", "en");
    expect(JSON.parse(String(call()[1].body))).toEqual({});
  });
});
