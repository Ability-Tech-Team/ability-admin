import { describe, expect, it, vi } from "vitest";
import { apiGet, ApiError } from "@/src/lib/apiClient";
import {
  DashboardAnswerError,
  toDashboardMetrics,
  toLatestServiceRequests,
  toProjectOccupancy,
  toTopServices,
} from "./dashboard";

// Answers shaped like ability-crm-api/apps/community-admin/src/dashboard/dashboard.service.ts.

const metrics = {
  total_projects: 3,
  total_units: 1710,
  active_customers: 1470,
  total_owners: 684,
  total_tenants: 786,
  total_guests: 236,
  avg_occupancy: 86.67,
  open_service_requests: 47,
  open_complaints: 19,
  total_invoices_value: 243000.5,
  total_collected_value: 125000,
};

describe("toDashboardMetrics", () => {
  it("adapts the metrics answer", () => {
    expect(toDashboardMetrics(metrics)).toEqual({
      totalProjects: 3,
      totalUnits: 1710,
      activeCustomers: 1470,
      totalOwners: 684,
      totalTenants: 786,
      totalGuests: 236,
      avgOccupancy: 86.67,
      openServiceRequests: 47,
      openComplaints: 19,
      totalInvoicesValue: 243000.5,
      totalCollectedValue: 125000,
    });
  });

  it("rejects an answer missing a figure instead of showing zero", () => {
    const incomplete: Partial<typeof metrics> = { ...metrics };
    delete incomplete.total_units;
    expect(() => toDashboardMetrics(incomplete)).toThrow(DashboardAnswerError);
  });
});

describe("toTopServices", () => {
  it("adapts each service and keeps its months in order", () => {
    const answer = {
      services: [
        {
          id: 4,
          name: "AC repair",
          total_requests: 9,
          monthly: [
            { month: "2026-10", requests: 4 },
            { month: "2026-11", requests: 5 },
          ],
        },
        { id: 7, name: null, total_requests: 1, monthly: [{ month: "2026-10", requests: 1 }] },
      ],
    };
    expect(toTopServices(answer)).toEqual([
      {
        id: 4,
        name: "AC repair",
        totalRequests: 9,
        monthly: [
          { month: "2026-10", requests: 4 },
          { month: "2026-11", requests: 5 },
        ],
      },
      { id: 7, name: null, totalRequests: 1, monthly: [{ month: "2026-10", requests: 1 }] },
    ]);
  });

  it("rejects a month that isn't YYYY-MM", () => {
    expect(() =>
      toTopServices({
        services: [{ id: 1, name: "x", total_requests: 1, monthly: [{ month: "Nov", requests: 1 }] }],
      }),
    ).toThrow(DashboardAnswerError);
  });
});

describe("toProjectOccupancy", () => {
  it("names the API's customers residents", () => {
    expect(
      toProjectOccupancy({
        projects: [
          { id: 2, name: "Marina", total_units: 320, occupied_units: 285, occupancy: 89.06, customers: 301 },
        ],
      }),
    ).toEqual([
      { id: 2, name: "Marina", totalUnits: 320, occupiedUnits: 285, occupancy: 89.06, residents: 301 },
    ]);
  });
});

describe("toLatestServiceRequests", () => {
  it("adapts each request", () => {
    const answer = [
      {
        id: 891,
        project: { id: 2, name: "Marina" },
        department: { id: 5, name: "Maintenance" },
        status: { id: 4, name: "In progress" },
        unit_number: "B-204",
        customer_name: "Ahmed",
        services: [{ id: 9, name: "AC repair", quantity: 2 }],
        arrival_time: "2026-11-21, 10:30",
        created_at: "2026-11-20, 09:15",
      },
    ];
    expect(toLatestServiceRequests(answer)).toEqual([
      {
        id: 891,
        project: { id: 2, name: "Marina" },
        department: { id: 5, name: "Maintenance" },
        status: { id: 4, name: "In progress" },
        unitNumber: "B-204",
        customerName: "Ahmed",
        services: [{ id: 9, name: "AC repair", quantity: 2 }],
        arrivalTime: "2026-11-21, 10:30",
        createdAt: "2026-11-20, 09:15",
      },
    ]);
  });

  it("rejects an answer that isn't a list", () => {
    expect(() => toLatestServiceRequests({ requests: [] })).toThrow(DashboardAnswerError);
  });
});

describe("apiGet", () => {
  const BASE = "/api/dev-proxy/admin/0";

  function respond(body: unknown) {
    return vi.fn(async () =>
      new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
  }

  it("sends only the filled query parameters, with the cookie and the page's language", async () => {
    const fetchImpl = respond({ result: { ok: true }, success: true, statusCode: 200 });

    await expect(
      apiGet(BASE, "/dashboard/metrics", { start_date: "2026-11-01", end_date: "" }, { locale: "ar", fetchImpl }),
    ).resolves.toEqual({ ok: true });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/dashboard/metrics?start_date=2026-11-01`);
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("include");
    expect(init.body).toBeUndefined();
    expect(init.headers).toMatchObject({ lang: "ar", "Accept-Language": "ar" });
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  it("leaves the query string out when nothing is filled", async () => {
    const fetchImpl = respond({ result: [], success: true, statusCode: 200 });
    await apiGet(BASE, "/dashboard/latest-service-requests", {}, { locale: "en", fetchImpl });
    expect(fetchImpl.mock.calls[0][0 as never]).toBe(`${BASE}/dashboard/latest-service-requests`);
  });

  it("reads a refusal from the body, as apiPost does", async () => {
    const fetchImpl = respond({
      result: { message: "Forbidden", message_code: "FORBIDDEN" },
      success: false,
      statusCode: 403,
    });
    const error = await apiGet(BASE, "/dashboard/metrics", {}, { locale: "en", fetchImpl }).catch(
      (err: unknown) => err,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(403);
  });
});
