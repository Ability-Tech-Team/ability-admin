import { describe, expect, it, vi } from "vitest";
import {
  COMPLAINT_STATUS,
  ComplaintsAnswerError,
  complaintFiltersQuery,
  createComplaint,
  fetchComplaints,
  nextComplaintStatusIds,
  toComplaintPage,
  type CreateComplaintBody,
} from "./complaints";

// Shaped like OrdersService.formatComplainRecord (ability-crm-api/libs/domain/src/orders/orders.service.ts):
// the complains row's own columns, then the names it adds.
const record = {
  id: 412,
  title: null,
  unit_number: "A-301",
  customer_name: "Ahmed Ali",
  customer_code: null,
  customer_id: 77,
  mobile_number: "01000000000",
  details: "Noise after quiet hours from the unit above.",
  department_id: 1,
  type_id: 1,
  status_id: 2,
  project_id: 2,
  request_from_id: 2,
  unit_id: 15,
  contact_channel_id: null,
  department_name: "General",
  contact_channel_name: null,
  status_name: "In progress",
  type_name: "General",
  request_sources: "Community App",
  created_by: null,
  complain_date: "2026-11-20, 08:15",
  complain_responses: [
    {
      response_id: 9,
      response: "We spoke to the neighbours.",
      status_name: "In progress",
      created_by: "Sara Admin",
      Date: "2026-11-21, 10:00",
    },
  ],
  media: [
    {
      id: "31",
      file_name: "voice.m4a",
      file_path: "complains/412/voice.m4a",
      media_type_id: 1,
      show_in_mobile: 1,
      created_at: "2026-11-20T08:15:00.000Z",
    },
  ],
  complain_logs: [
    {
      log_id: 20,
      action_name: "Update",
      description: "Complain response added by Sara Admin",
      created_by: "Sara Admin",
      Date: "2026-11-21, 10:00",
    },
    { log_id: 19, action_name: null, description: null, created_by: null, Date: "2026-11-20, 08:15" },
  ],
};

describe("toComplaintPage", () => {
  it("adapts a page of complaints", () => {
    expect(toComplaintPage({ total_count: 1, total_pages: 1, complains: [record] })).toEqual({
      totalCount: 1,
      totalPages: 1,
      complaints: [
        {
          id: 412,
          title: null,
          typeName: "General",
          details: "Noise after quiet hours from the unit above.",
          unitNumber: "A-301",
          customerName: "Ahmed Ali",
          mobileNumber: "01000000000",
          departmentName: "General",
          statusId: 2,
          statusName: "In progress",
          sourceName: "Community App",
          createdBy: null,
          createdAt: "2026-11-20, 08:15",
          responses: [
            { id: 9, text: "We spoke to the neighbours.", statusName: "In progress", author: "Sara Admin", at: "2026-11-21, 10:00" },
          ],
          logs: [
            { id: 20, actionName: "Update", description: "Complain response added by Sara Admin", actor: "Sara Admin", at: "2026-11-21, 10:00" },
            { id: 19, actionName: null, description: null, actor: null, at: "2026-11-20, 08:15" },
          ],
        },
      ],
    });
  });

  it("reads an empty page", () => {
    expect(toComplaintPage({ total_count: 0, total_pages: 0, complains: [] })).toEqual({
      complaints: [],
      totalCount: 0,
      totalPages: 0,
    });
  });

  it("rejects an answer without its totals", () => {
    expect(() => toComplaintPage({ complains: [record] })).toThrow(ComplaintsAnswerError);
  });

  it("rejects a complaint without its details", () => {
    const broken: Record<string, unknown> = { ...record };
    delete broken.details;
    expect(() => toComplaintPage({ total_count: 1, total_pages: 1, complains: [broken] })).toThrow(
      ComplaintsAnswerError,
    );
  });
});

describe("complaintFiltersQuery", () => {
  it("looks for a complaint number", () => {
    expect(complaintFiltersQuery({ search: " 412 ", statusId: null })).toEqual({
      complain_id: "412",
      customer_name: undefined,
      status_id: undefined,
    });
  });

  it("looks for anything else in the customer's name", () => {
    expect(complaintFiltersQuery({ search: "Ahmed", statusId: COMPLAINT_STATUS.open })).toEqual({
      complain_id: undefined,
      customer_name: "Ahmed",
      status_id: 1,
    });
  });

  it("sends nothing for an empty search", () => {
    expect(complaintFiltersQuery({ search: "   ", statusId: null })).toEqual({
      complain_id: undefined,
      customer_name: undefined,
      status_id: undefined,
    });
  });
});

describe("fetchComplaints", () => {
  it("asks for one page with the DTO's parameter names", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ result: { total_count: 0, total_pages: 0, complains: [] }, success: true, statusCode: 200 }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchImpl);
    try {
      await fetchComplaints("https://api.test/admin", { search: "Ahmed", statusId: 3 }, 1, "ar");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/orders/complains?customer_name=Ahmed&status_id=3&page=1&limit=10",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("nextComplaintStatusIds", () => {
  it("offers only later statuses", () => {
    expect(nextComplaintStatusIds(COMPLAINT_STATUS.open)).toEqual([2, 3, 4]);
    expect(nextComplaintStatusIds(COMPLAINT_STATUS.rejected)).toEqual([]);
  });
});

describe("createComplaint", () => {
  const body: CreateComplaintBody = {
    project_id: 2,
    unit_id: 31,
    unit_number: "A-301",
    customer_id: 77,
    customer_name: "Ahmed Ali",
    type_id: 5,
    department_id: 9,
    status_id: 1,
    details: "Leak",
    complain_date: "2026-11-23",
    request_from_id: 1,
  };

  async function send(result: unknown) {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ result, success: true, statusCode: 201 }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    try {
      return { id: await createComplaint("https://api.test/admin", body, "ar"), fetchImpl };
    } finally {
      vi.unstubAllGlobals();
    }
  }

  it("posts the DTO's body and resolves with the new complaint's id", async () => {
    // As OrdersService.createComplain answers.
    const { id, fetchImpl } = await send({ message: "Complain created successfully", complain_id: 413 });
    expect(id).toBe(413);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/orders/complains",
      expect.objectContaining({ method: "POST", body: JSON.stringify(body) }),
    );
  });

  it("still resolves when the answer doesn't name the complaint, since it was saved", async () => {
    const { id } = await send({ message: "Complain created successfully" });
    expect(id).toBeNull();
  });
});
