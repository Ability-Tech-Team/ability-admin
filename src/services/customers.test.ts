import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQueryString } from "@/src/lib/apiClient";
import {
  createCustomer,
  CustomersAnswerError,
  customersSheetRequest,
  customersQuery,
  deleteCustomer,
  fetchCustomers,
  importSheet,
  toCustomerDetail,
  toCustomersPage,
  toImportJob,
  toQueuedImport,
  updateCustomer,
  type CustomerFilters,
} from "./customers";
import {
  avatarColorOf,
  buildCreateCustomerBody,
  buildUpdateCustomerBody,
  CREATE_REQUIRED,
  customerFormFrom,
  emptyCustomerForm,
  initialsOf,
  missingFields,
  ownershipNames,
  primaryUnit,
  singleChoice,
} from "@/src/app/[locale]/(app)/master-data/customers/utils";

// Answers shaped like libs/domain/src/customers/customer-shared.service.ts (`formatCustomer`,
// `getCustomers`, `getCustomer`, `deleteCustomer`), company-projects.service.ts (`getProjects`)
// and imports.service.ts (`queue`, `formatImportJob`).

function customerUnit(overrides: Record<string, unknown> = {}) {
  return {
    start_date: "2022-03-15",
    sign_date: "2022-03-15",
    end_date: null,
    contract_number: "C-301",
    is_active: 1,
    is_deleted: 0,
    ownership_id: 1,
    ownership: "Owner",
    owner_type_name: "Owner",
    unit_details: {
      project_id: 4,
      project_name: "Marina Heights",
      id: 301,
      unit_number: "A-301",
      unit_specification_id: 12,
      is_locked: 0,
      unit_specifications: { id: 12, unit_type_id: 3, unit_type_name: "Apartment", locations: [] },
    },
    ...overrides,
  };
}

function customer(overrides: Record<string, unknown> = {}) {
  return {
    id: 17,
    customer_name: "Ahmed Al Rashidi",
    country_id: 1,
    id_type: 2,
    id_number: "29801011234567",
    mobile_number: "201001234567",
    telephone_number: null,
    first_address: null,
    second_address: null,
    city: null,
    marital_status_id: 2,
    religion_id: 1,
    email: "ahmed@example.com",
    emergency_contact: null,
    emergency_contact_relation: null,
    emergency_contact_phone_number: null,
    customer_type_id: 1,
    notes: null,
    is_active: 1,
    is_deleted: 0,
    customer_code: "C001",
    birth_date: null,
    profile_picture: null,
    created_by: null,
    updated_by: null,
    created_at: "2022-03-15T10:20:00.000Z",
    updated_at: null,
    is_male: 1,
    customer_type_name: "Individual",
    marital_status_name: "Married",
    religion_name: "Muslim",
    country_name: "Egypt",
    id_type_name: "National ID",
    customer_units: [customerUnit()],
    customer_cars: [],
    attachments: [
      { id: "88", file_name: "id.pdf", file_path: "https://media.example/signed/id.pdf", created_at: "2022-03-15, 10:20" },
    ],
    ...overrides,
  };
}

const filters: CustomerFilters = { search: "", searchField: "name", projectId: null, ownershipId: null };

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

describe("toCustomersPage", () => {
  it("adapts the list answer", () => {
    const page = toCustomersPage({ total_count: 42000, total_pages: 2100, customers: [customer()] });
    expect(page.totalCount).toBe(42000);
    expect(page.totalPages).toBe(2100);
    expect(page.customers[0]).toEqual({
      id: 17,
      name: "Ahmed Al Rashidi",
      code: "C001",
      idTypeId: 2,
      idTypeName: "National ID",
      idNumber: "29801011234567",
      email: "ahmed@example.com",
      mobile: "201001234567",
      countryId: 1,
      countryName: "Egypt",
      customerTypeId: 1,
      customerTypeName: "Individual",
      maritalStatusId: 2,
      maritalStatusName: "Married",
      religionId: 1,
      religionName: "Muslim",
      active: true,
      createdOn: "2022-03-15",
      units: [
        {
          unitId: 301,
          unitNumber: "A-301",
          projectId: 4,
          projectName: "Marina Heights",
          ownershipId: 1,
          ownershipName: "Owner",
          active: true,
        },
      ],
      attachments: [
        { id: "88", fileName: "id.pdf", url: "https://media.example/signed/id.pdf", createdAt: "2022-03-15, 10:20" },
      ],
    });
  });

  it("leaves out deleted unit links and keeps the nullable fields null", () => {
    const page = toCustomersPage({
      total_count: 1,
      total_pages: 1,
      customers: [
        customer({
          email: null,
          mobile_number: null,
          customer_code: null,
          country_id: null,
          country_name: null,
          is_active: 0,
          created_at: null,
          customer_units: [customerUnit({ is_deleted: 1 }), customerUnit({ is_active: 0, ownership_id: 2, ownership: "Renter" })],
        }),
      ],
    });
    const [row] = page.customers;
    expect(row.active).toBe(false);
    expect(row.email).toBeNull();
    expect(row.createdOn).toBeNull();
    expect(row.units).toHaveLength(1);
    expect(row.units[0]).toMatchObject({ ownershipId: 2, ownershipName: "Renter", active: false });
  });

  it("rejects an answer without the customers array", () => {
    expect(() => toCustomersPage({ total_count: 1, total_pages: 1 })).toThrow(CustomersAnswerError);
    expect(() => toCustomersPage({ totalCount: 1, totalPages: 1, customers: [] })).toThrow(CustomersAnswerError);
  });
});

describe("toCustomerDetail", () => {
  it("adds the customer's projects", () => {
    const detail = toCustomerDetail({ ...customer(), projects: [{ id: 4, name: "Marina Heights" }, { id: 5, name: null }] });
    expect(detail.projects).toEqual([{ id: 4, name: "Marina Heights" }, { id: 5, name: null }]);
    expect(detail.name).toBe("Ahmed Al Rashidi");
  });

  it("rejects a detail without projects", () => {
    expect(() => toCustomerDetail(customer())).toThrow(CustomersAnswerError);
  });
});

describe("customersQuery", () => {
  it("sends the search in the chosen field and leaves empty filters out", () => {
    expect(buildQueryString(customersQuery({ ...filters, search: "  Ahmed " }))).toBe("?customer_name=Ahmed");
    expect(buildQueryString(customersQuery({ ...filters, search: "0100", searchField: "mobile" }))).toBe("?mobile_number=0100");
    expect(buildQueryString(customersQuery({ ...filters, search: "298", searchField: "idNumber" }))).toBe("?id_number=298");
    expect(buildQueryString(customersQuery({ ...filters, search: "A-1", searchField: "unit" }))).toBe("?unit_number=A-1");
    expect(buildQueryString(customersQuery({ ...filters, search: "C1", searchField: "code" }))).toBe("?customer_code=C1");
    expect(buildQueryString(customersQuery(filters))).toBe("");
  });

  it("filters by project and ownership", () => {
    expect(buildQueryString(customersQuery({ ...filters, projectId: 4, ownershipId: 2 }))).toBe("?project_id=4&ownership_id=2");
  });

  it("builds the export link without paging", () => {
    const request = customersSheetRequest({ ...filters, projectId: 4 });
    expect(request.path + buildQueryString(request.query)).toBe("/customers?project_id=4&is_excel=1");
  });
});

describe("customer requests", () => {
  const BASE = "/api/dev-proxy/admin/0";

  it("asks for one page with the filters", async () => {
    const call = stubFetch({ total_count: 0, total_pages: 0, customers: [] });
    await fetchCustomers(BASE, { ...filters, search: "Ahmed" }, 3, "ar");
    const [url, init] = call();
    expect(url).toBe(`${BASE}/customers?customer_name=Ahmed&page=3&limit=20`);
    expect(init.method).toBe("GET");
  });

  it("creates with the DTO's fields and resolves with the new id", async () => {
    const call = stubFetch({ ...customer(), customer_units: undefined });
    const body = {
      project_id: 4,
      customer_name: "Mona",
      country_id: 1,
      id_type: 2,
      id_number: "29901011234567",
      marital_status_id: 1,
      religion_id: 1,
      customer_type_id: 1,
    };
    await expect(createCustomer(BASE, body, "en")).resolves.toBe(17);
    const [url, init] = call();
    expect(url).toBe(`${BASE}/customers`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(body);
  });

  it("updates with a PUT", async () => {
    const call = stubFetch({ message: "CUSTOMER_UPDATED_SUCCESSFULLY" });
    await updateCustomer(BASE, 17, { is_active: 0 }, "en");
    const [url, init] = call();
    expect(url).toBe(`${BASE}/customers/17`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ is_active: 0 });
  });

  it("deletes from one project, sent in the body", async () => {
    const call = stubFetch({ message: "CUSTOMER_DELETED_SUCCESSFULLY", is_customer_deleted: false });
    await expect(deleteCustomer(BASE, 17, 4, "en")).resolves.toBe(false);
    const [url, init] = call();
    expect(url).toBe(`${BASE}/customers/17`);
    expect(init.method).toBe("DELETE");
    expect(JSON.parse(String(init.body))).toEqual({ project_id: 4 });
  });

  it("uploads an import as a form with the project and the file", async () => {
    const call = stubFetch({
      import_id: 9,
      status: "PENDING",
      type: "customers",
      file_name: "customers.xlsx",
      message: "IMPORT_QUEUED",
      expected_columns: { required: ["customer_name", "id_number", "unit_number"], optional: ["mobile"] },
    });
    const file = new File(["x"], "customers.xlsx");
    await expect(importSheet(BASE, "customers", 4, file, "en")).resolves.toEqual({
      importId: 9,
      fileName: "customers.xlsx",
      requiredColumns: ["customer_name", "id_number", "unit_number"],
      optionalColumns: ["mobile"],
    });
    const [url, init] = call();
    expect(url).toBe(`${BASE}/imports/customers`);
    const form = init.body as FormData;
    expect(form.get("project_id")).toBe("4");
    expect((form.get("file") as File).name).toBe("customers.xlsx");
  });
});

describe("projects and imports", () => {
  it("adapts an import job and refuses an unknown status", () => {
    const job = {
      id: 9,
      type: "customers",
      status: "COMPLETED_WITH_ERRORS",
      file_name: "customers.xlsx",
      total_rows: 10,
      inserted_rows: 7,
      updated_rows: 1,
      skipped_rows: 0,
      failed_rows: 2,
      has_error_report: true,
      error_message: null,
      created_by_id: "e1",
      created_by_name: "Admin",
      notify_email: null,
      created_at: "2026-11-22, 10:00",
      started_at: null,
      finished_at: null,
      duration_seconds: null,
    };
    expect(toImportJob(job)).toEqual({
      id: 9,
      status: "COMPLETED_WITH_ERRORS",
      totalRows: 10,
      insertedRows: 7,
      updatedRows: 1,
      skippedRows: 0,
      failedRows: 2,
      hasErrorReport: true,
      errorMessage: null,
    });
    expect(() => toImportJob({ ...job, status: "DONE" })).toThrow(CustomersAnswerError);
    expect(() => toQueuedImport({ import_id: 9 })).toThrow(CustomersAnswerError);
  });
});

describe("customer screen utils", () => {
  const row = toCustomersPage({ total_count: 1, total_pages: 1, customers: [customer()] }).customers[0];

  it("draws initials and a steady color", () => {
    expect(initialsOf("Ahmed Al Rashidi")).toBe("AA");
    expect(initialsOf("  محمد  ")).toBe("م");
    expect(avatarColorOf(17)).toBe(avatarColorOf(17));
  });

  it("takes a filter's value only when exactly one is ticked", () => {
    expect(singleChoice(new Set())).toBeNull();
    expect(singleChoice(new Set(["4"]))).toBe("4");
    expect(singleChoice(new Set(["4", "5"]))).toBeNull();
  });

  it("shows an active unit first and each ownership once", () => {
    const mixed = {
      ...row,
      units: [
        { ...row.units[0], unitId: 1, active: false, ownershipName: "Renter" },
        { ...row.units[0], unitId: 2, active: true, ownershipName: "Owner" },
        { ...row.units[0], unitId: 3, active: true, ownershipName: "Owner" },
      ],
    };
    expect(primaryUnit(mixed)?.unitId).toBe(2);
    expect(ownershipNames(mixed)).toEqual(["Owner", "Renter"]);
    expect(primaryUnit({ ...row, units: [] })).toBeNull();
  });

  it("builds the create body with numbers and without empty optional fields", () => {
    const values = {
      ...emptyCustomerForm("4"),
      name: " Mona ",
      mobile: "",
      email: "",
      idTypeId: "2",
      idNumber: "29901011234567",
      countryId: "1",
      customerTypeId: "1",
      maritalStatusId: "1",
      religionId: "3",
    };
    expect(missingFields(values, CREATE_REQUIRED)).toEqual(["mobile"]);
    expect(buildCreateCustomerBody(values)).toEqual({
      project_id: 4,
      customer_name: "Mona",
      country_id: 1,
      id_type: 2,
      id_number: "29901011234567",
      marital_status_id: 1,
      religion_id: 3,
      customer_type_id: 1,
    });
  });

  it("sends only the changed fields on edit, never an emptied mobile or email", () => {
    const values = customerFormFrom(row);
    expect(buildUpdateCustomerBody(row, values)).toEqual({});
    expect(
      buildUpdateCustomerBody(row, { ...values, name: "Ahmed R.", email: "", religionId: "2", idTypeId: "1" }),
    ).toEqual({ customer_name: "Ahmed R.", religion_id: 2, id_type: 1 });
  });
});
