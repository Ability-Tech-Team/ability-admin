import { describe, expect, it, vi } from "vitest";
import {
  ServiceRequestsAnswerError,
  TICKET_STATUS,
  changeStatusBody,
  fetchServiceRequests,
  nextTicketStatusIds,
  serviceRequestFiltersQuery,
  serviceRequestsSheetRequest,
  toServiceRequestDetail,
  toServiceRequestPage,
  toServiceRequestStats,
} from "./serviceRequests";

// Shaped like HelperService.formatTicket (ability-crm-api/libs/core/src/helper/helper.service.ts),
// as OrdersService.getTickets / getTicketById return it. Prisma's Decimal comes as a string.
const ticket = {
  ticket_id: 891,
  customer_name: "Ahmed Ali",
  customer_mobile: "01000000000",
  requester_name: "Ahmed Ali",
  requester_mobile: "01000000000",
  unit_number: "A-301",
  unit_type: "Apartment",
  notes: null,
  has_runner_cashier: 0,
  sla_status: 1,
  delay_status: 0,
  runner_cashier_price: "0",
  is_urgent: 1,
  reject_reason: null,
  contact_channel_id: null,
  contact_channel_name: null,
  ticket_total_price: 350,
  department_id: 2,
  department_name: "Maintenance",
  arrival_time: "2026-11-23, 09:30",
  actual_arrival_time: "09:30",
  duration: "12h 3m",
  request_from_id: 2,
  ticket_source_name: "Community App",
  last_status_id: 4,
  last_status_name: "Inprogress",
  seen_by: "Sara Admin",
  agent_id: "1f0e7a52-1d8e-4c55-9a39-6f9b3c7f6e10",
  agent_name: "Sara Admin",
  request_time: { dateTime: "2026-11-22, 21:27", date: "2026-11-22", time: "21:27" },
  services: [
    { service_id: 5, service_name: "AC repair", quantity: 1, price: 350, total_price: 350 },
  ],
  collected_by: null,
  created_by: "Sara Admin",
  done_by: null,
  logs: [
    {
      log_id: 12,
      ticket_status_id: 4,
      ticket_status_name: "Inprogress",
      log_description: "Ticket status changed to Inprogress by Sara Admin",
      created_by: "Sara Admin",
      created_at: { dateTime: "2026-11-22, 22:00", date: "2026-11-22", time: "22:00" },
    },
  ],
  comments: [
    {
      comment_id: 3,
      comment: "Technician on the way",
      position: null,
      created_by: "Sara Admin",
      created_at: { dateTime: "2026-11-22, 22:05", date: "2026-11-22", time: "22:05" },
    },
  ],
  invoices: [
    { invoice_number: "26112221000891", invoice_status_id: 1, invoice_status_name: "Pending", is_pending: true, is_voided: false },
  ],
};

const adapted = {
  id: 891,
  customerName: "Ahmed Ali",
  customerMobile: "01000000000",
  requesterName: "Ahmed Ali",
  unitNumber: "A-301",
  unitType: "Apartment",
  notes: null,
  departmentName: "Maintenance",
  sourceName: "Community App",
  statusId: 4,
  statusName: "Inprogress",
  rejectReason: null,
  isUrgent: true,
  overdueSla: true,
  arrivalDate: "2026-11-23",
  arrivalTime: "09:30",
  requestedAt: "2026-11-22, 21:27",
  agentName: "Sara Admin",
  services: [{ id: 5, name: "AC repair", quantity: 1, totalPrice: 350 }],
  totalPrice: 350,
  logs: [
    {
      id: 12,
      statusName: "Inprogress",
      description: "Ticket status changed to Inprogress by Sara Admin",
      actor: "Sara Admin",
      at: "2026-11-22, 22:00",
    },
  ],
  comments: [
    { id: 3, text: "Technician on the way", author: "Sara Admin", position: null, at: "2026-11-22, 22:05" },
  ],
};

describe("toServiceRequestPage", () => {
  it("adapts a page of tickets", () => {
    expect(toServiceRequestPage({ total_count: 11, total_pages: 2, tickets: [ticket] })).toEqual({
      requests: [adapted],
      totalCount: 11,
      totalPages: 2,
    });
  });

  it("reads the empty array the service answers when nothing matches", () => {
    expect(toServiceRequestPage([])).toEqual({ requests: [], totalCount: 0, totalPages: 0 });
  });

  it("keeps a ticket without a creator or an Arabic name", () => {
    const withoutAgent: Record<string, unknown> = { ...ticket, department_name: null };
    delete withoutAgent.agent_id;
    delete withoutAgent.agent_name;
    const [request] = toServiceRequestPage({ total_count: 1, total_pages: 1, tickets: [withoutAgent] }).requests;
    expect(request.agentName).toBeNull();
    expect(request.departmentName).toBeNull();
  });

  it("rejects a ticket without its status", () => {
    const broken: Record<string, unknown> = { ...ticket };
    delete broken.last_status_id;
    expect(() => toServiceRequestPage({ total_count: 1, total_pages: 1, tickets: [broken] })).toThrow(
      ServiceRequestsAnswerError,
    );
  });
});

describe("toServiceRequestDetail", () => {
  it("adapts one ticket", () => {
    expect(toServiceRequestDetail(ticket)).toEqual(adapted);
  });
});

describe("toServiceRequestStats", () => {
  it("adapts the counts", () => {
    expect(toServiceRequestStats({ total: 40, open: 12, in_progress: 5, critical: 3, overdue_sla: 7 })).toEqual({
      total: 40,
      open: 12,
      inProgress: 5,
      critical: 3,
      overdueSla: 7,
    });
  });

  it("rejects counts that are missing one", () => {
    expect(() => toServiceRequestStats({ total: 40, open: 12, in_progress: 5, critical: 3 })).toThrow(
      ServiceRequestsAnswerError,
    );
  });
});

describe("serviceRequestsSheetRequest", () => {
  it("exports every ticket the list's filters match, without paging", () => {
    const request = serviceRequestsSheetRequest({ search: " Ahmed ", exact: true, statusId: 2, projectId: 5 });
    expect(request).toEqual({
      path: "/orders/tickets",
      query: { search: "Ahmed", is_exact: 1, status_id: 2, project_id: 5, is_excel: 1 },
      fallbackName: "service-requests.xlsx",
    });
  });
});

describe("serviceRequestFiltersQuery", () => {
  it("sends only the filters that are set", () => {
    expect(serviceRequestFiltersQuery({ search: "  ", exact: true, statusId: null, projectId: null })).toEqual({
      search: "",
      is_exact: undefined,
      status_id: undefined,
      project_id: undefined,
    });
  });

  it("sends exact search only with a search term", () => {
    expect(serviceRequestFiltersQuery({ search: " A-301 ", exact: true, statusId: 4, projectId: 2 })).toEqual({
      search: "A-301",
      is_exact: 1,
      status_id: 4,
      project_id: 2,
    });
  });
});

describe("fetchServiceRequests", () => {
  it("asks for one page with the DTO's parameter names", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ result: [], success: true, statusCode: 200 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    try {
      await fetchServiceRequests("https://api.test/admin", { search: "ac", exact: false, statusId: 1, projectId: null }, 2, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/orders/tickets?search=ac&status_id=1&page=2&limit=10",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("nextTicketStatusIds", () => {
  it("offers only later statuses", () => {
    expect(nextTicketStatusIds(TICKET_STATUS.confirmed)).toEqual([4, 5, 6, 7]);
  });

  it("offers nothing once done or rejected", () => {
    expect(nextTicketStatusIds(TICKET_STATUS.done)).toEqual([]);
    expect(nextTicketStatusIds(TICKET_STATUS.rejected)).toEqual([]);
  });
});

describe("changeStatusBody", () => {
  it("sends a reason only when rejecting", () => {
    expect(changeStatusBody(TICKET_STATUS.done, "ignored")).toEqual({ status_id: 6 });
    expect(changeStatusBody(TICKET_STATUS.rejected, " Duplicate ")).toEqual({ status_id: 7, reject_reason: "Duplicate" });
  });
});
