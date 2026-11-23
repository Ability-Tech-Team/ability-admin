import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQueryString } from "@/src/lib/apiClient";
import {
  createGuestInvitation,
  fetchGuestInvitationCounts,
  fetchGuestInvitations,
  guestInvitationsQuery,
  GuestInvitationsAnswerError,
  setGuestInvitationActive,
  toGuestInvitation,
  toGuestInvitationsPage,
} from "./guestInvitations";
import type { CustomerUnit } from "./customers";
import {
  apiStatusOf,
  buildCreateGuestInvitationBody,
  emptyGuestInvitationForm,
  invalidGuestFields,
  invitableUnits,
  qrStatusOf,
  residentSearchFilters,
} from "@/src/app/[locale]/(app)/operations/guest-invitations/utils";

// Answers shaped like `formatGuestInvitation`, `getGuestInvitations` and
// `createGuestInvitation` in libs/domain/src/customers/customer-shared.service.ts.

function invitation(overrides: Record<string, unknown> = {}) {
  return {
    id: 10428,
    status: "active",
    is_active: 1,
    valid_from: "2026-11-22, 08:00",
    valid_to: "2026-11-22, 20:00",
    created_at: "2026-11-21, 07:50",
    project: { id: 4, name: "Gouna" },
    unit: { id: 402, unit_number: "Villa 402" },
    invited_by: { id: 17, customer_name: "Passant Shaaban", mobile_number: "201004021188" },
    guest: {
      id: 9,
      guest_name: "Sara Magdy",
      mobile_number: "201004021100",
      gender: "female",
      email: null,
      birth_date: null,
    },
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(results: unknown[]) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ result: results.shift(), success: true, statusCode: 200 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("toGuestInvitationsPage", () => {
  it("adapts the list answer", () => {
    const page = toGuestInvitationsPage({ total_count: 1, total_pages: 1, guest_invitations: [invitation()] });
    expect(page.totalCount).toBe(1);
    expect(page.invitations[0]).toEqual({
      id: 10428,
      status: "active",
      validFrom: "2026-11-22, 08:00",
      validTo: "2026-11-22, 20:00",
      createdAt: "2026-11-21, 07:50",
      projectId: 4,
      projectName: "Gouna",
      unitId: 402,
      unitNumber: "Villa 402",
      residentId: 17,
      residentName: "Passant Shaaban",
      residentMobile: "201004021188",
      guestName: "Sara Magdy",
      guestMobile: "201004021100",
      guestGender: "female",
      guestEmail: null,
      guestBirthDate: null,
    });
  });

  it("refuses a status the API doesn't define", () => {
    expect(() => toGuestInvitation(invitation({ status: "revoked" }))).toThrow(GuestInvitationsAnswerError);
    expect(() => toGuestInvitationsPage({ total_count: 1, guest_invitations: [] })).toThrow(GuestInvitationsAnswerError);
  });
});

describe("guestInvitationsQuery", () => {
  it("sends the search, exact only with a search, and the status", () => {
    expect(buildQueryString(guestInvitationsQuery({ search: " Sara ", exact: true, status: "upcoming" }))).toBe(
      "?search=Sara&is_exact=1&status=upcoming",
    );
    expect(buildQueryString(guestInvitationsQuery({ search: "", exact: true, status: null }))).toBe("");
  });
});

describe("guest invitation requests", () => {
  const BASE = "/api/dev-proxy/admin/0";

  it("asks for one page", async () => {
    const fetchMock = stubFetch([{ total_count: 0, total_pages: 0, guest_invitations: [] }]);
    await fetchGuestInvitations(BASE, { search: "", exact: false, status: "expired" }, 2, "en");
    expect(fetchMock.mock.calls[0][0 as never]).toBe(`${BASE}/customers/guest-invitations?status=expired&page=2&limit=20`);
  });

  it("counts the running and upcoming invitations from one-row pages", async () => {
    const fetchMock = stubFetch([
      { total_count: 3, total_pages: 3, guest_invitations: [invitation()] },
      { total_count: 5, total_pages: 5, guest_invitations: [invitation({ status: "upcoming" })] },
    ]);
    await expect(fetchGuestInvitationCounts(BASE, "en")).resolves.toEqual({ active: 3, upcoming: 5 });
    const urls = fetchMock.mock.calls.map((call) => call[0 as never]);
    expect(urls).toEqual([
      `${BASE}/customers/guest-invitations?status=active&page=1&limit=1`,
      `${BASE}/customers/guest-invitations?status=upcoming&page=1&limit=1`,
    ]);
  });

  it("creates and resolves with the invitation's id", async () => {
    const fetchMock = stubFetch([
      { message: "GUEST_INVITATION_CREATED_SUCCESSFULLY", invitation_id: 10429, invitationQr: "qr", hc_enabled: false },
    ]);
    const body = {
      project_id: 4,
      customer_id: 17,
      unit_id: 402,
      guest_name: "Sara",
      mobile_number: "01004021100",
      valid_from: "2026-11-23T08:00",
      valid_to: "2026-11-23T20:00",
    };
    await expect(createGuestInvitation(BASE, body, "en")).resolves.toBe(10429);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/customers/guest-invitations`);
    expect(JSON.parse(String(init.body))).toEqual(body);
  });

  it("revokes with is_active 0", async () => {
    const fetchMock = stubFetch([{ message: "GUEST_INVITATION_UPDATED_SUCCESSFULLY" }]);
    await setGuestInvitationActive(BASE, 10428, false, "en");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/customers/guest-invitations/10428`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ is_active: 0 });
  });
});

describe("guest invitation screen utils", () => {
  const unit: CustomerUnit = {
    unitId: 402,
    unitNumber: "Villa 402",
    projectId: 4,
    projectName: "Gouna",
    ownershipId: 1,
    ownershipName: "Owner",
    active: true,
  };

  it("maps the API's statuses to the screen's and back", () => {
    expect(qrStatusOf("upcoming")).toBe("scheduled");
    expect(qrStatusOf("inactive")).toBe("revoked");
    expect(apiStatusOf("revoked")).toBe("inactive");
    expect(apiStatusOf("scheduled")).toBe("upcoming");
    expect(apiStatusOf(null)).toBeNull();
    expect(apiStatusOf("unknown")).toBeNull();
  });

  it("searches residents by mobile for digits, else by name", () => {
    expect(residentSearchFilters(" +20 100 ")).toMatchObject({ search: "+20 100", searchField: "mobile" });
    expect(residentSearchFilters("Passant")).toMatchObject({ search: "Passant", searchField: "name" });
  });

  it("offers only active units", () => {
    expect(invitableUnits([unit, { ...unit, unitId: 1, active: false }])).toEqual([unit]);
  });

  it("checks the required fields and the period", () => {
    const empty = emptyGuestInvitationForm();
    expect(invalidGuestFields(empty)).toEqual(["guestName", "guestPhone", "residentId", "unitId", "validFrom", "validTo"]);
    const filled = {
      ...empty,
      guestName: "Sara",
      guestPhone: "01004021100",
      residentId: "17",
      unitId: "402",
      validFrom: "2026-11-23T20:00",
      validTo: "2026-11-23T08:00",
    };
    expect(invalidGuestFields(filled)).toEqual(["validTo"]);
    expect(invalidGuestFields({ ...filled, validTo: "2026-11-24T08:00" })).toEqual([]);
  });

  it("builds the create body from the chosen unit", () => {
    const values = {
      ...emptyGuestInvitationForm(),
      guestName: " Sara ",
      guestPhone: "01004021100",
      guestEmail: "",
      guestGender: "female",
      residentId: "17",
      unitId: "402",
      validFrom: "2026-11-23T08:00",
      validTo: "2026-11-23T20:00",
    };
    expect(buildCreateGuestInvitationBody(values, unit)).toEqual({
      project_id: 4,
      customer_id: 17,
      unit_id: 402,
      guest_name: "Sara",
      mobile_number: "01004021100",
      valid_from: "2026-11-23T08:00",
      valid_to: "2026-11-23T20:00",
      gender: "female",
    });
  });
});
