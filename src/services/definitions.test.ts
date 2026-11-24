import { describe, expect, it, vi } from "vitest";
import {
  DefinitionsAnswerError,
  fetchDropdowns,
  fetchServiceOptions,
  flattenLocations,
  toDropdowns,
  toServiceOptions,
} from "./definitions";

// Shaped like DefinitionsService.getAllDropDowns (ability-crm-api/libs/domain/src/definitions).
const named = (id: number, en: string) => ({ id, name: en, en_name: en, ar_name: `ع ${en}` });
const answer = {
  countries: [{ ...named(1, "Egypt"), nationality: "Egyptian", country_code: "EG", phone_code: "+20" }],
  id_types: [named(1, "Passport"), named(2, "National ID")],
  marital_statuses: [named(1, "Single")],
  religions: [named(1, "Muslim")],
  customer_types: [named(1, "Individual")],
  unit_types: [named(3, "Villa")],
  locations: [
    {
      id: 10,
      name: "Tower A",
      en_name: "Tower A",
      ar_name: "برج أ",
      is_active: 1,
      parent_location_id: null,
      children: [{ id: 11, name: "Floor 2", en_name: "Floor 2", ar_name: "د2", is_active: 1, parent_location_id: 10, children: [] }],
    },
  ],
  sub_projects: [{ id: 4, project_id: 2, project_code: "PH1", name: "PH1", en_name: null, ar_name: null }],
  departments: [{ ...named(7, "Maintenance"), show_in_mobile: 1, is_active: 1 }],
  invoice_types: [{ ...named(8, "Maintenance fee"), is_maintenance: 1, is_rental: 0 }],
  complain_types: [{ ...named(9, "Noise"), department_id: 7, is_active: 1 }],
  complain_statuses: [named(1, "Open")],
  contact_channels: [named(2, "Phone")],
  menuitems: [named(99, "Ignored")],
};

describe("toDropdowns", () => {
  it("adapts the lists the forms use", () => {
    expect(toDropdowns(answer)).toEqual({
      countries: [{ id: 1, name: "Egypt" }],
      idTypes: [
        { id: 1, name: "Passport" },
        { id: 2, name: "National ID" },
      ],
      maritalStatuses: [{ id: 1, name: "Single" }],
      religions: [{ id: 1, name: "Muslim" }],
      customerTypes: [{ id: 1, name: "Individual" }],
      unitTypes: [{ id: 3, name: "Villa" }],
      locations: [
        { id: 10, name: "Tower A" },
        { id: 11, name: "Tower A › Floor 2" },
      ],
      subProjects: [{ id: 4, name: "PH1" }],
      departments: [{ id: 7, name: "Maintenance" }],
      invoiceTypes: [{ id: 8, name: "Maintenance fee" }],
      complaintTypes: [{ id: 9, name: "Noise", departmentId: 7 }],
      complaintStatuses: [{ id: 1, name: "Open" }],
      contactChannels: [{ id: 2, name: "Phone" }],
    });
  });

  it("leaves out an odd row instead of failing every list, and falls back to the English name", () => {
    const result = toDropdowns({ ...answer, religions: [{ id: "x" }, { id: 2, name: null, en_name: "Christian" }] });
    expect(result.religions).toEqual([{ id: 2, name: "Christian" }]);
  });

  it("rejects a list that isn't a list", () => {
    expect(() => toDropdowns({ ...answer, countries: "Egypt" })).toThrow(DefinitionsAnswerError);
    expect(() => toDropdowns(null)).toThrow(DefinitionsAnswerError);
  });
});

describe("flattenLocations", () => {
  it("names each location after its parents", () => {
    expect(flattenLocations([{ id: 1, name: "A", children: [{ id: 2, name: "B", children: [{ id: 3, name: "C", children: [] }] }] }])).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "A › B" },
      { id: 3, name: "A › B › C" },
    ]);
  });
});

describe("toServiceOptions", () => {
  it("reads the price Prisma sends as a string", () => {
    expect(
      toServiceOptions({ totalCount: 1, totalPages: 1, services: [{ id: 5, service_name: "AC repair", department_id: 7, price: "150.50" }] }),
    ).toEqual([{ id: 5, name: "AC repair", departmentId: 7, price: 150.5 }]);
  });
});

describe("requests", () => {
  function stubFetch(result: unknown) {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ result, success: true, statusCode: 200 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchImpl);
    return fetchImpl;
  }

  it("asks for one project's dropdowns, or the default without one", async () => {
    const fetchImpl = stubFetch(answer);
    try {
      await fetchDropdowns("https://api.test/admin", 2, "en");
      await fetchDropdowns("https://api.test/admin", null, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "https://api.test/admin/definitions/all-dropdowns?project_id=2", expect.objectContaining({ method: "GET" }));
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "https://api.test/admin/definitions/all-dropdowns", expect.objectContaining({ method: "GET" }));
  });

  it("asks for a department's active services in a project", async () => {
    const fetchImpl = stubFetch({ totalCount: 0, totalPages: 0, services: [] });
    try {
      await fetchServiceOptions("https://api.test/admin", { projectId: 2, departmentId: 7 }, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/definitions/services?project_id=2&department_id=7&is_active=1&page=1&limit=500",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
