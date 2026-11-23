import { describe, expect, it } from "vitest";
import {
  OWNERSHIP_OWNER,
  OWNERSHIP_RENTER,
  UnitAssignmentsAnswerError,
  buildAssignUnitBody,
  customerSearchQuery,
  toCustomerOptions,
  toUnitAssignmentDetail,
  toUnitAssignmentsPage,
  unitAssignmentsQuery,
} from "./unitAssignments";

// Answers shaped like CompanyProjectsService.getUnitAssignments / getUnitAssignment
// (libs/domain/src/company-projects/company-projects.service.ts, loadAssignments).

const assignment = {
  id: 812,
  unit: { id: 55, unit_number: "301" },
  project: { id: 3, name: "Marina Heights" },
  customer: { id: 10, customer_name: "Ahmed Al Rashidi" },
  unit_customers: [
    { id: 10, customer_name: "Ahmed Al Rashidi" },
    { id: 11, customer_name: "Nadia Al Rashidi" },
  ],
  family_members: [{ id: 20, customer_name: "Omar Al Rashidi", relation: "Son", is_active: 1 }],
  ownership: { id: 1, name: "Owner" },
  start_date: "2022-03-15",
  end_date: null,
  is_active: 1,
};

const adapted = {
  id: 812,
  unit: { id: 55, unitNumber: "301" },
  project: { id: 3, name: "Marina Heights" },
  customer: { id: 10, name: "Ahmed Al Rashidi" },
  unitCustomers: [
    { id: 10, name: "Ahmed Al Rashidi" },
    { id: 11, name: "Nadia Al Rashidi" },
  ],
  familyMembers: [{ id: 20, name: "Omar Al Rashidi", relation: "Son", active: true }],
  ownership: { id: 1, name: "Owner" },
  startDate: "2022-03-15",
  endDate: null,
  active: true,
};

describe("toUnitAssignmentsPage", () => {
  it("adapts the page and each assignment", () => {
    expect(
      toUnitAssignmentsPage({ total_count: 1, total_pages: 1, assignments: [assignment] }),
    ).toEqual({ totalCount: 1, totalPages: 1, assignments: [adapted] });
  });

  it("reads an ended assignment and an inactive relative", () => {
    const ended = {
      ...assignment,
      end_date: "2025-01-01",
      is_active: 0,
      family_members: [{ id: 20, customer_name: "Omar", relation: null, is_active: 0 }],
    };
    const [row] = toUnitAssignmentsPage({ total_count: 1, total_pages: 1, assignments: [ended] }).assignments;
    expect(row.active).toBe(false);
    expect(row.endDate).toBe("2025-01-01");
    expect(row.familyMembers).toEqual([{ id: 20, name: "Omar", relation: null, active: false }]);
  });

  it("rejects an assignment without its unit", () => {
    const broken: Record<string, unknown> = { ...assignment };
    delete broken.unit;
    expect(() =>
      toUnitAssignmentsPage({ total_count: 1, total_pages: 1, assignments: [broken] }),
    ).toThrow(UnitAssignmentsAnswerError);
  });
});

describe("toUnitAssignmentDetail", () => {
  it("adds the contract details", () => {
    expect(
      toUnitAssignmentDetail({
        ...assignment,
        sign_date: "2022-03-01",
        contract_number: "C-1",
        notes: null,
      }),
    ).toEqual({ ...adapted, signDate: "2022-03-01", contractNumber: "C-1", notes: null });
  });

  it("rejects a detail without the contract fields", () => {
    expect(() => toUnitAssignmentDetail(assignment)).toThrow(UnitAssignmentsAnswerError);
  });
});

describe("unitAssignmentsQuery", () => {
  it("sends only GetUnitAssignmentsDto's params", () => {
    expect(
      unitAssignmentsQuery({
        search: " 301 ",
        projectId: 3,
        ownershipId: OWNERSHIP_RENTER,
        active: true,
        page: 2,
        limit: 20,
      }),
    ).toEqual({ search: "301", project_id: 3, ownership_id: 2, is_active: 1, page: 2, limit: 20 });
  });

  it("leaves unset filters out", () => {
    expect(unitAssignmentsQuery({ search: "", page: 1, limit: 20 })).toEqual({
      search: "",
      project_id: undefined,
      ownership_id: undefined,
      is_active: undefined,
      page: 1,
      limit: 20,
    });
  });
});

describe("customers", () => {
  it("asks GetCustomersDto for one small page of the project's customers", () => {
    expect(customerSearchQuery(" Ahm ", 3)).toEqual({
      customer_name: "Ahm",
      project_id: 3,
      page: 1,
      limit: 10,
    });
  });

  it("adapts the customer list (shaped like CustomerSharedService.getCustomers)", () => {
    const answer = {
      total_count: 1,
      total_pages: 1,
      customers: [
        {
          id: 10,
          customer_name: "Ahmed",
          id_number: "29801011234567",
          mobile_number: null,
          customer_units: [],
          customer_cars: [],
          attachments: [],
        },
      ],
    };
    expect(toCustomerOptions(answer)).toEqual([
      { id: 10, name: "Ahmed", idNumber: "29801011234567", mobileNumber: null },
    ]);
  });
});

describe("buildAssignUnitBody", () => {
  const input = {
    customerId: 10,
    projectId: 3,
    unitNumber: " 301 ",
    ownershipId: OWNERSHIP_OWNER,
    contractNumber: " C-1 ",
    signDate: "2026-11-01",
    startDate: "2026-11-02",
    endDate: "",
  } as const;

  it("builds AssignUnitToCustomerDto, active without an end date", () => {
    expect(buildAssignUnitBody(input)).toEqual({
      customer_id: 10,
      project_id: 3,
      unit_number: "301",
      ownership_id: 1,
      contract_number: "C-1",
      sign_date: "2026-11-01",
      start_date: "2026-11-02",
      is_active: 1,
    });
  });

  it("sends the end date and saves it inactive, as the API does", () => {
    expect(buildAssignUnitBody({ ...input, endDate: "2027-11-01" })).toMatchObject({
      end_date: "2027-11-01",
      is_active: 0,
    });
  });
});
