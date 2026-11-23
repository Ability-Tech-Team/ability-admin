import { describe, expect, it } from "vitest";
import { buildQueryString } from "@/src/lib/apiClient";
import {
  UnitsAnswerError,
  importErrorReportRequest,
  isImportRunning,
  toImportJob,
  toQueuedImport,
  toUnitsPage,
  unitImportFileProblem,
  unitsExportRequest,
  unitsQuery,
  type UnitsFilter,
} from "./units";
import { ownerInitials } from "@/src/app/[locale]/(app)/master-data/units/utils";

// Answers shaped like ability-crm-api/libs/domain/src/units/units.service.ts (getUnits,
// formatUnit) and libs/domain/src/imports/imports.service.ts (queue, formatImportJob).

const owner = {
  customer_unit_id: 5,
  customer_id: 9,
  mobile_number: "01012345678",
  customer_name: "Ahmed Al Rashidi",
  customer_code: "C-009",
  customer_type_id: 1,
  customer_type_name: "Individual",
  id_type_id: 1,
  id_type_name: "National ID",
  id_number: "29801011234567",
  ownership_type_id: 1,
  ownership_type_name: "Owner",
  owner_type_id: null,
  owner_type_name: null,
  sign_date: "2025-01-10T00:00:00.000Z",
  contract_number: "CN-77",
};

const unit = {
  id: 41,
  unit_number: "A-301",
  project_id: 2,
  sub_project_id: 3,
  unit_specification_id: 77,
  notes: null,
  is_active: 1,
  is_broker: 0,
  is_eligible_for_rent: 1,
  is_locked: 0,
  debit_amount: 1250.5,
  debt_updated_at: null,
  project_name: "Marina Heights",
  sub_project_code: "TWR-A",
  rental_company_name: null,
  locked_by: null,
  unlocked_by: null,
  active_unit_blocks: [],
  unit_specifications: {
    id: 77,
    location_id: 1,
    address: "Tower A",
    total_area: "120.5",
    floor: 3,
    is_furnished: 0,
    unit_type_id: 4,
    unit_type_name: "Apartment",
    locations: [],
  },
  unit_customers_count: 1,
  customer_units: [owner],
};

describe("toUnitsPage", () => {
  it("adapts a page of units with their current owners", () => {
    expect(toUnitsPage({ totalCount: 1, totalPages: 1, currentPage: 1, units: [unit] })).toEqual({
      totalCount: 1,
      totalPages: 1,
      units: [
        {
          id: 41,
          unitNumber: "A-301",
          projectId: 2,
          projectName: "Marina Heights",
          subProjectCode: "TWR-A",
          unitTypeName: "Apartment",
          floor: 3,
          isActive: true,
          owners: [{ customerId: 9, name: "Ahmed Al Rashidi", contractNumber: "CN-77" }],
        },
      ],
    });
  });

  it("keeps a unit without an owner, building or floor", () => {
    const page = toUnitsPage({
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      units: [
        {
          ...unit,
          is_active: 0,
          sub_project_code: null,
          customer_units: [],
          unit_specifications: { ...unit.unit_specifications, floor: null },
        },
      ],
    });
    expect(page.units[0]).toMatchObject({ isActive: false, subProjectCode: null, floor: null, owners: [] });
  });

  it("reads an empty contract number as none", () => {
    const page = toUnitsPage({ totalCount: 1, totalPages: 1, currentPage: 1, units: [{ ...unit, customer_units: [{ ...owner, contract_number: "" }] }] });
    expect(page.units[0].owners[0].contractNumber).toBeNull();
  });

  it("rejects an answer without units", () => {
    expect(() => toUnitsPage({ totalCount: 1, totalPages: 1 })).toThrow(UnitsAnswerError);
    expect(() => toUnitsPage([unit])).toThrow(UnitsAnswerError);
  });
});

const filter: UnitsFilter = { projectId: 2, unitNumber: " A-3 ", exact: false, active: undefined };

describe("unitsQuery", () => {
  it("asks for every unit, owned or not, with only what GetUnitsDto declares", () => {
    expect(unitsQuery(filter, 2, 20)).toEqual({
      all_units: 1,
      project_id: 2,
      unit_number: "A-3",
      is_exact: undefined,
      is_active: undefined,
      page: 2,
      limit: 20,
    });
  });

  it("asks for an exact match only with a unit number", () => {
    expect(unitsQuery({ ...filter, unitNumber: "A-301", exact: true }, 1, 20).is_exact).toBe(1);
    const empty = unitsQuery({ projectId: undefined, unitNumber: "  ", exact: true, active: undefined }, 1, 20);
    expect(buildQueryString(empty)).toBe("?all_units=1&page=1&limit=20");
  });

  it("filters by status as 1 or 0", () => {
    expect(unitsQuery({ ...filter, active: true }, 1, 20).is_active).toBe(1);
    expect(unitsQuery({ ...filter, active: false }, 1, 20).is_active).toBe(0);
  });

  it("exports every matching unit, without paging", () => {
    const request = unitsExportRequest({ ...filter, active: false });
    expect(request.path + buildQueryString(request.query)).toBe(
      "/projects/units?all_units=1&project_id=2&unit_number=A-3&is_active=0&is_excel=1",
    );
  });
});

describe("unit imports", () => {
  it("adapts the queued import", () => {
    expect(
      toQueuedImport({
        import_id: 12,
        status: "PENDING",
        type: "units",
        file_name: "units.xlsx",
        message: "IMPORT_QUEUED",
        expected_columns: { required: ["unit_number"], optional: ["unit_type", "area", "floor"] },
      }),
    ).toEqual({
      importId: 12,
      status: "PENDING",
      fileName: "units.xlsx",
      expectedColumns: { required: ["unit_number"], optional: ["unit_type", "area", "floor"] },
    });
  });

  it("adapts an import's progress", () => {
    const job = toImportJob({
      id: 12,
      type: "units",
      status: "COMPLETED_WITH_ERRORS",
      file_name: "units.xlsx",
      total_rows: 10,
      inserted_rows: 8,
      updated_rows: null,
      skipped_rows: 0,
      failed_rows: 2,
      has_error_report: true,
      error_message: null,
      created_by_id: "e1",
      created_by_name: "Sara",
      notify_email: null,
      created_at: "2026-11-22, 10:00",
      started_at: "2026-11-22, 10:00",
      finished_at: "2026-11-22, 10:01",
      duration_seconds: 42,
    });
    expect(job).toMatchObject({ id: 12, status: "COMPLETED_WITH_ERRORS", insertedRows: 8, failedRows: 2, hasErrorReport: true });
    expect(isImportRunning(job.status)).toBe(false);
    expect(isImportRunning("PROCESSING")).toBe(true);
  });

  it("rejects an unknown import status", () => {
    expect(() =>
      toQueuedImport({ import_id: 1, status: "DONE", file_name: "x.csv", expected_columns: { required: [], optional: [] } }),
    ).toThrow(UnitsAnswerError);
  });

  it("checks the file against the importer's limits", () => {
    expect(unitImportFileProblem({ name: "Units.XLSX", size: 1000 })).toBeNull();
    expect(unitImportFileProblem({ name: "units.csv", size: 1000 })).toBeNull();
    expect(unitImportFileProblem({ name: "units.pdf", size: 1000 })).toBe("type");
    expect(unitImportFileProblem({ name: "units.xlsx", size: 6 * 1024 * 1024 })).toBe("size");
  });

  it("links the error report with the import's project", () => {
    const request = importErrorReportRequest(12, 2);
    expect(request.path + buildQueryString(request.query)).toBe("/imports/12/errors?project_id=2");
  });
});

describe("ownerInitials", () => {
  it("takes the first letters of the first two words", () => {
    expect(ownerInitials("Ahmed Al Rashidi")).toBe("AA");
    expect(ownerInitials("  nour  ")).toBe("N");
    expect(ownerInitials("محمد الزعابي")).toBe("ما");
  });
});
