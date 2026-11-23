import { describe, expect, it } from "vitest";
import { buildQueryString } from "@/src/lib/apiClient";
import {
  ID_TYPE,
  RENTAL_STATUS,
  RentalsAnswerError,
  WALK_IN_STATUS,
  buildNewRentalForm,
  checkOutBody,
  reservationActions,
  reservationsSheetRequest,
  reservationsQuery,
  terminateBody,
  toReservationDetail,
  toRentableUnitsPage,
  toReservationsPage,
  toWalkInDetail,
  toWalkInPage,
  walkInActions,
  walkInQuery,
} from "./rentals";
import {
  newRentalProblem,
  parsePenalty,
  rentalDialogProblem,
} from "@/src/app/[locale]/(app)/master-data/rental-management/schema";
import { statusBadgeClass } from "@/src/app/[locale]/(app)/master-data/rental-management/utils";

// Answers shaped like ability-crm-api/libs/domain/src/rentals/rentals.service.ts
// (searchReservations, getReservationDetails, searchWalkInRentalRequests,
// getWalkInRentalRequestDetails).

describe("toReservationsPage", () => {
  it("adapts a page of reservations", () => {
    expect(
      toReservationsPage({
        total_count: 21,
        total_pages: 3,
        current_page: 1,
        reservations: [
          {
            id: 7,
            unit_number: "A-301",
            created_at: "2026-11-01",
            start_date: "2026-11-05",
            end_date: "",
            tenant_name: "Fatima Al Suwaidi",
            mobile_number: null,
            rental_status_id: 1,
            rental_status_name: "Fees collection pending",
            request_source_name: "CRM",
          },
        ],
      }),
    ).toEqual({
      totalCount: 21,
      totalPages: 3,
      items: [
        {
          id: 7,
          unitNumber: "A-301",
          tenantName: "Fatima Al Suwaidi",
          mobileNumber: null,
          startDate: "2026-11-05",
          endDate: null,
          createdAt: "2026-11-01",
          statusId: 1,
          statusName: "Fees collection pending",
          sourceName: "CRM",
        },
      ],
    });
  });

  it("rejects a page without its totals", () => {
    expect(() => toReservationsPage({ reservations: [] })).toThrow(RentalsAnswerError);
  });
});

describe("reservationsQuery", () => {
  it("sends the search in the chosen field with the filters", () => {
    const filter = { searchField: "id_number" as const, search: " 2980 ", projectId: 2, statusId: 2 };
    expect(reservationsQuery(filter)).toEqual({ id_number: "2980", project_id: 2, rental_status: 2 });
  });

  it("leaves out an empty search and empty filters", () => {
    const filter = { searchField: "customer_name" as const, search: "  ", projectId: null, statusId: null };
    expect(buildQueryString(reservationsQuery(filter))).toBe("");
  });

  it("builds the export link with is_excel", () => {
    const filter = { searchField: "unit_number" as const, search: "A-3", projectId: null, statusId: 1 };
    const request = reservationsSheetRequest(filter);
    expect(request.path + buildQueryString(request.query)).toBe(
      "/rentals/reservations?unit_number=A-3&rental_status=1&is_excel=1",
    );
  });
});

describe("toReservationDetail", () => {
  const answer = {
    reservation: {
      id: 7,
      unit_number: "A-301",
      unit_id: 41,
      project_id: 2,
      project_name: "Marina Heights",
      start_date: "2026-11-05",
      sign_date: "2026-11-05",
      end_date: null,
      rental_status_id: 5,
      rental_status_name: "Terminated",
      access_card_number: "AC-1",
      notes: null,
      total_tenant_count: 2,
      rental_company_id: 3,
      rental_company_name: "Ability Rentals",
      tenant_rating: null,
      termination_reason: "Broke the rules",
      penalty_amount: "500.00",
      from_app: { id: 1, name: "CRM" },
    },
    tenant: {
      id: 9,
      customer_name: "Fatima",
      id_type: { id: 1, name: "Passport" },
      id_number: "A29874122",
      mobile_number: "01012345678",
      email: null,
      cars: [],
    },
    relatives: [
      {
        id: 10,
        customer_name: "Omar",
        id_number: "29801011234567",
        mobile_number: null,
        email: null,
        relative_relation: "son",
        cars: [],
        assignment: null,
        from_app: null,
      },
    ],
    media: [
      {
        id: "55",
        file_name: "contract.pdf",
        file_path: "https://bucket.example/contract.pdf?X-Amz-Signature=x",
        description: "",
        id_number: "A29874122",
        customer_name: "Fatima",
        created_at: "2026-11-05T10:00:00.000Z",
      },
    ],
    invoices: [],
  };

  it("adapts the reservation, its tenants and attachments", () => {
    const detail = toReservationDetail(answer);
    expect(detail).toMatchObject({
      id: 7,
      projectName: "Marina Heights",
      endDate: null,
      statusId: 5,
      penaltyAmount: 500,
      rentalCompanyName: "Ability Rentals",
      terminationReason: "Broke the rules",
      sourceName: "CRM",
      tenant: { name: "Fatima", idType: { id: 1, name: "Passport" }, idNumber: "A29874122" },
    });
    expect(detail.relatives).toEqual([
      { id: 10, name: "Omar", idType: null, idNumber: "29801011234567", mobileNumber: null, email: null, relation: "son" },
    ]);
    expect(detail.attachments).toEqual([
      {
        id: "55",
        fileName: "contract.pdf",
        url: "https://bucket.example/contract.pdf?X-Amz-Signature=x",
        description: null,
        ownerName: "Fatima",
      },
    ]);
  });

  it("rejects an answer without the tenant", () => {
    const broken: Partial<typeof answer> = { ...answer };
    delete broken.tenant;
    expect(() => toReservationDetail(broken)).toThrow(RentalsAnswerError);
  });
});

describe("reservation actions", () => {
  it("follows the API's status rules", () => {
    expect(reservationActions(RENTAL_STATUS.FEES_COLLECTION_PENDING)).toEqual({
      checkIn: true,
      cancel: true,
      extend: true,
      checkOut: false,
      terminate: false,
    });
    expect(reservationActions(RENTAL_STATUS.ACTIVE)).toEqual({
      checkIn: false,
      cancel: false,
      extend: true,
      checkOut: true,
      terminate: true,
    });
    expect(Object.values(reservationActions(RENTAL_STATUS.FINISHED)).some(Boolean)).toBe(false);
    expect(Object.values(reservationActions(null)).some(Boolean)).toBe(false);
  });

  it("builds the check-out and termination bodies the DTOs accept", () => {
    expect(checkOutBody({ tenantRating: 4, penaltyAmount: null })).toEqual({ tenant_rating: 4 });
    expect(checkOutBody({ tenantRating: 2, penaltyAmount: 150.5 })).toEqual({ tenant_rating: 2, penalty_amount: 150.5 });
    expect(terminateBody({ reason: " Left early ", penaltyAmount: 0 })).toEqual({
      termination_reason: "Left early",
      penalty_amount: 0,
    });
  });
});

describe("buildNewRentalForm", () => {
  it("sends the fields CreateRentalTenantDto requires, one tenant, files as tenant_files", () => {
    const file = new File(["%PDF"], "id.pdf", { type: "application/pdf" });
    const form = buildNewRentalForm({
      projectId: 2,
      unitId: 41,
      unitNumber: "A-301",
      rentalCompanyId: 3,
      customerName: " Fatima ",
      idType: ID_TYPE.PASSPORT,
      idNumber: "A29874122",
      mobileNumber: "",
      startDate: "2026-12-01",
      endDate: "2027-11-30",
      files: [file],
    });
    const fields = Object.fromEntries(
      [...form.entries()].filter(([, value]) => typeof value === "string"),
    );
    expect(fields).toEqual({
      project_id: "2",
      unit_id: "41",
      unit_number: "A-301",
      rental_company_id: "3",
      customer_name: "Fatima",
      id_type: "1",
      id_number: "A29874122",
      start_date: "2026-12-01",
      end_date: "2027-11-30",
      total_tenant_count: "1",
    });
    expect(form.getAll("tenant_files")).toHaveLength(1);
    expect(form.has("mobile_number")).toBe(false);
  });
});

describe("walk-in requests", () => {
  it("adapts a page of requests", () => {
    const page = toWalkInPage({
      total_count: 1,
      total_pages: 1,
      current_page: 1,
      reservations: [
        {
          id: 3,
          unit_number: "B-12",
          unit_id: 50,
          start_date: "2026-12-01",
          end_date: "2027-05-31",
          tenant_name: "Mohammed",
          mobile_number: "01098765432",
          rental_status_id: 1,
          rental_status_name: "Pending",
          id_number: "29804151234567",
          reject_reason: null,
          project_id: 2,
          project_name: "Marina Heights",
          source_id: 1,
          source_name: "Broker",
          rental_company_id: 3,
          rental_company_name: "Ability Rentals",
          delegate_id: null,
          created_at: "2026-11-20",
          updated_at: null,
          delegate_name: null,
          delegate_phone_number: null,
          delegate_national_id: null,
          total_tenant_count: 1,
          access_card_number: null,
        },
      ],
    });
    expect(page).toEqual({
      totalCount: 1,
      totalPages: 1,
      items: [
        {
          id: 3,
          unitNumber: "B-12",
          projectName: "Marina Heights",
          tenantName: "Mohammed",
          idNumber: "29804151234567",
          mobileNumber: "01098765432",
          startDate: "2026-12-01",
          endDate: "2027-05-31",
          statusId: 1,
          statusName: "Pending",
          sourceId: 1,
          sourceName: "Broker",
          rejectReason: null,
        },
      ],
    });
  });

  it("never sends a mobile number search, which the DTO doesn't declare", () => {
    expect(
      walkInQuery({ searchField: "mobile_number", search: "010", projectId: null, statusId: 1, sourceId: 3 }),
    ).toEqual({ project_id: undefined, rental_status: 1, source: 3 });
    expect(
      walkInQuery({ searchField: "unit_number", search: "B-1", projectId: 2, statusId: null, sourceId: null }),
    ).toEqual({ unit_number: "B-1", project_id: 2, rental_status: undefined, source: undefined });
  });

  it("adapts a request's details", () => {
    const detail = toWalkInDetail({
      reservation: {
        id: 3,
        unit_number: "B-12",
        project_id: 2,
        project_name: "Marina Heights",
        start_date: "2026-12-01",
        end_date: "2027-05-31",
        rental_status_id: 3,
        rental_status_name: "Rejected",
        reject_reason: "Unit unavailable",
        access_card_number: null,
        notes: null,
        total_tenant_count: 2,
        rental_company_id: 3,
        rental_company_name: "Ability Rentals",
        source: { id: 1, name: "Broker" },
        source_id: 1,
        source_name: "Broker",
        delegate_id: 4,
        delegate: { id: 4, name: "Broker Co", national_id: "29801011234567", phone_number: "0100" },
        relative_to: null,
        relative_relation: null,
        created_at: "2026-11-20T08:00:00.000Z",
      },
      tenant: {
        id: 3,
        customer_name: "Mohammed",
        id_type: { id: 2, name: "National ID" },
        id_number: "29804151234567",
        mobile_number: "01098765432",
        email: "m@example.com",
        cars: [],
        is_male: 1,
        notes: null,
      },
      relatives: [
        {
          id: 4,
          customer_name: "Sara",
          id_type: null,
          id_number: "29901011234567",
          mobile_number: "01011112222",
          email: null,
          relative_relation: "wife",
          relative_to: 3,
          cars: [],
          assignment: {},
          source: null,
        },
      ],
      media: [
        {
          id: "8",
          request_id: 3,
          file_name: "id.jpg",
          file_path: "https://bucket.example/id.jpg",
          description: null,
          id_number: "29804151234567",
          customer_name: "Mohammed",
          created_at: "2026-11-20T08:00:00.000Z",
        },
      ],
    });
    expect(detail).toMatchObject({
      statusId: 3,
      rejectReason: "Unit unavailable",
      delegate: { name: "Broker Co", nationalId: "29801011234567", phoneNumber: "0100" },
      tenant: { idType: { id: 2, name: "National ID" }, email: "m@example.com" },
    });
    expect(detail.relatives[0]).toMatchObject({ name: "Sara", relation: "wife", idType: null });
    expect(detail.attachments[0].url).toBe("https://bucket.example/id.jpg");
  });

  it("offers accept and reject only on open requests", () => {
    expect(walkInActions(WALK_IN_STATUS.PENDING)).toEqual({ accept: true, reject: true });
    expect(walkInActions(WALK_IN_STATUS.UNIT_RESERVED)).toEqual({ accept: true, reject: true });
    expect(walkInActions(WALK_IN_STATUS.ACCEPTED)).toEqual({ accept: false, reject: false });
  });
});

// Shaped like libs/domain/src/rentals/rentals.service.ts (getUnits).
describe("toRentableUnitsPage", () => {
  const unit = {
    id: 41,
    unit_number: "A-301",
    project_id: 2,
    project_name: "Marina Heights",
    is_active: 1,
    rental_company_id: 3,
    owner: { id: 9, customer_name: "Ahmed", customer_code: "C-009", mobile_number: null, email: null, id_number: "29801011234567" },
    active_unit_blocks: [],
    unit_specifications: { floor: 3, address: "Tower A", is_furnished: 0, unit_type_name: "Apartment" },
  };

  it("adapts a page of rentable units", () => {
    const page = toRentableUnitsPage({ total_count: 1, total_pages: 1, current_page: 1, units: [unit] });
    expect(page).toMatchObject({ totalCount: 1, totalPages: 1 });
    expect(page.units[0]).toEqual({
      id: 41,
      unitNumber: "A-301",
      projectId: 2,
      projectName: "Marina Heights",
      unitTypeName: "Apartment",
      floor: 3,
      address: "Tower A",
      isActive: true,
      isFurnished: false,
      rentalCompanyId: 3,
      owner: { id: 9, name: "Ahmed", code: "C-009", mobileNumber: null, email: null, idNumber: "29801011234567" },
      activeBlocks: 0,
    });
  });

  it("reads the empty array the API answers when nothing matches", () => {
    expect(toRentableUnitsPage([])).toEqual({ units: [], totalCount: 0, totalPages: 0 });
    expect(() => toRentableUnitsPage([unit])).toThrow(RentalsAnswerError);
  });
});

// The screen's pure rules (rental-management/schema.ts, utils.ts).

describe("rental form rules", () => {
  const unit = {
    id: 41,
    unitNumber: "A-301",
    projectId: 2,
    projectName: "Marina Heights",
    unitTypeName: "Apartment",
    floor: 3,
    address: null,
    isActive: true,
    isFurnished: false,
    rentalCompanyId: 3,
    owner: null,
    activeBlocks: 0,
  };
  const values = {
    projectId: 2,
    unitId: 41,
    customerName: "Fatima",
    idType: ID_TYPE.PASSPORT,
    idNumber: "A29874122",
    mobileNumber: "",
    startDate: "2026-12-01",
    endDate: "2027-11-30",
    files: [],
  };

  it("accepts a complete rental", () => {
    expect(newRentalProblem(values, unit)).toBeNull();
  });

  it("names the first problem", () => {
    expect(newRentalProblem({ ...values, customerName: " " }, unit)).toBe("required");
    expect(newRentalProblem(values, null)).toBe("required");
    expect(newRentalProblem({ ...values, idNumber: "1234567" }, unit)).toBe("idNumberLength");
    expect(newRentalProblem({ ...values, endDate: "2026-12-01" }, unit)).toBe("endBeforeStart");
    expect(newRentalProblem(values, { ...unit, rentalCompanyId: null })).toBe("noRentalCompany");
  });

  it("checks each dialog's fields", () => {
    const empty = { rating: "", penalty: "", newEndDate: "", reason: "" };
    expect(rentalDialogProblem("checkIn", empty)).toBeNull();
    expect(rentalDialogProblem("checkOut", empty)).toBe("rating");
    expect(rentalDialogProblem("checkOut", { ...empty, rating: "6" })).toBe("rating");
    expect(rentalDialogProblem("checkOut", { ...empty, rating: "5", penalty: "-1" })).toBe("penalty");
    expect(rentalDialogProblem("checkOut", { ...empty, rating: "5", penalty: "20.5" })).toBeNull();
    expect(rentalDialogProblem("terminate", { ...empty, reason: "  " })).toBe("reason");
    expect(rentalDialogProblem("extend", { ...empty, newEndDate: "2027-01-31" })).toBeNull();
    expect(rentalDialogProblem("extend", empty)).toBe("newEndDate");
    expect(rentalDialogProblem("reject", { ...empty, reason: "Unit taken" })).toBeNull();
  });

  it("reads an optional penalty", () => {
    expect(parsePenalty("")).toBeNull();
    expect(parsePenalty(" 0 ")).toBe(0);
    expect(parsePenalty("abc")).toBe("invalid");
  });

  it("colours statuses, an unknown one grey", () => {
    expect(statusBadgeClass("reservations", RENTAL_STATUS.ACTIVE)).toContain("green");
    expect(statusBadgeClass("walkIns", WALK_IN_STATUS.REJECTED)).toContain("red");
    expect(statusBadgeClass("reservations", 99)).toContain("gray");
    expect(statusBadgeClass("walkIns", null)).toContain("gray");
  });
});
