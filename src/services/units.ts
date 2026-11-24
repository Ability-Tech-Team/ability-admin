import { z } from "zod";
import { apiGet, apiPost, apiPut, type DownloadRequest } from "@/src/lib/apiClient";

/**
 * Units, as the Community Admin API serves them (`ability-crm-api/apps/community-admin`,
 * prefix `/admin`), over the same rules as the CRM's units (libs/domain/src/units, apps/community-admin/src/units):
 *
 * - `GET /projects/units?all_units=1` lists every unit of the projects the user can reach (or of the one
 *   asked for), owned or not, with each unit's current owners; with `is_excel=1` the matching
 *   units come back as a spreadsheet.
 * - `POST /projects/units` creates a unit (`CreateUnitDto`) in the project sent, which the admin
 *   API requires; Add Unit takes its unit types, locations and buildings from
 *   `GET /definitions/all-dropdowns` (src/services/definitions.ts).
 * - `PUT /projects/units/:id` changes a unit (`UpdateUnitDto`, every field optional); the screen sends
 *   only `is_active`. A unit outside the user's projects is refused.
 * - `POST /imports/units` (libs/domain/src/imports) queues a spreadsheet of units for a
 *   project; `GET /imports/:id` reports its progress and `GET /imports/:id/errors` streams
 *   the rejected rows as a file.
 *
 * Each call resolves with the adapted answer or throws: `ApiError` (src/lib/apiClient.ts)
 * when the API refuses or can't be reached, `UnitsAnswerError` when an answer doesn't have
 * the expected shape.
 */

export class UnitsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "UnitsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new UnitsAnswerError(route);
  return parsed.data;
}

// GET /projects/units

/** A current owner (the list's `customer_units`: active owner rows without an end date). */
export type UnitOwner = {
  customerId: number;
  name: string;
  contractNumber: string | null;
};

export type Unit = {
  id: number;
  unitNumber: string;
  projectId: number;
  /** In the request's language. */
  projectName: string | null;
  /** The building (sub-project) code, when the unit has one. */
  subProjectCode: string | null;
  /** In the request's language. */
  unitTypeName: string | null;
  floor: number | null;
  isActive: boolean;
  owners: UnitOwner[];
};

export type UnitsPage = {
  units: Unit[];
  totalCount: number;
  totalPages: number;
};

const unitSchema = z.object({
  id: z.number().int(),
  unit_number: z.string(),
  project_id: z.number().int(),
  project_name: z.string().nullable().optional(),
  sub_project_code: z.string().nullable().optional(),
  is_active: z.number().int(),
  unit_specifications: z.object({
    floor: z.number().int().nullable().optional(),
    unit_type_name: z.string().nullable().optional(),
  }),
  customer_units: z.array(
    z.object({
      customer_id: z.number().int(),
      customer_name: z.string(),
      contract_number: z.string().nullable().optional(),
    }),
  ),
});

const unitsPageSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  units: z.array(unitSchema),
});

function toUnit(unit: z.infer<typeof unitSchema>): Unit {
  return {
    id: unit.id,
    unitNumber: unit.unit_number,
    projectId: unit.project_id,
    projectName: unit.project_name ?? null,
    subProjectCode: unit.sub_project_code ?? null,
    unitTypeName: unit.unit_specifications.unit_type_name ?? null,
    floor: unit.unit_specifications.floor ?? null,
    isActive: unit.is_active === 1,
    owners: unit.customer_units.map((owner) => ({
      customerId: owner.customer_id,
      name: owner.customer_name,
      contractNumber: owner.contract_number || null,
    })),
  };
}

export function toUnitsPage(result: unknown): UnitsPage {
  const data = parse(unitsPageSchema, result, "units");
  return {
    units: data.units.map(toUnit),
    totalCount: data.totalCount,
    totalPages: data.totalPages,
  };
}

export type UnitsFilter = {
  /** Undefined: every project the user can reach. */
  projectId: number | undefined;
  /** Matches part of the unit number, or all of it with `exact`. */
  unitNumber: string;
  exact: boolean;
  /** Undefined: active and inactive units. */
  active: boolean | undefined;
};

/** The filters as `GetUnitsDto` takes them, every unit included (`all_units`), owned or not. */
function filterQuery(filter: UnitsFilter) {
  const unitNumber = filter.unitNumber.trim();
  return {
    all_units: 1,
    project_id: filter.projectId,
    unit_number: unitNumber || undefined,
    is_exact: unitNumber && filter.exact ? 1 : undefined,
    is_active: filter.active === undefined ? undefined : filter.active ? 1 : 0,
  };
}

/** The query `GetUnitsDto` accepts; it declares `page` and `limit` (as strings). */
export function unitsQuery(filter: UnitsFilter, page: number, limit: number) {
  return { ...filterQuery(filter), page, limit };
}

export async function fetchUnits(
  apiBaseUrl: string,
  filter: UnitsFilter,
  page: number,
  limit: number,
  locale: string,
): Promise<UnitsPage> {
  const result = await apiGet(apiBaseUrl, "/projects/units", unitsQuery(filter, page, limit), { locale });
  return toUnitsPage(result);
}

/** Every unit matching the filters as a spreadsheet, for `useApiDownload`. */
export function unitsExportRequest(filter: UnitsFilter): DownloadRequest {
  return { path: "/projects/units", query: { ...filterQuery(filter), is_excel: 1 }, fallbackName: "units.xlsx" };
}

// PUT /projects/units/:id

/** Turns a unit on or off; it answers with a message only. */
export async function setUnitActive(apiBaseUrl: string, unitId: number, active: boolean, locale: string) {
  await apiPut(apiBaseUrl, `/projects/units/${unitId}`, { is_active: active ? 1 : 0 }, { locale });
}

// POST /projects/units

/** A new unit, as the Add Unit form checked it (`validateUnitForm`). */
export type NewUnit = {
  /** The admin API requires one: the Super Admin's choice, or the sign-in project. */
  projectId: number;
  /** The building (sub-project); null leaves the unit without one. */
  subProjectId: number | null;
  unitNumber: string;
  unitTypeId: number;
  locationId: number;
  /** In m², above 0. */
  totalArea: number;
  floor: number | null;
};

/**
 * `CreateUnitDto`: a new unit starts active, unlocked, not a broker unit, not offered for rent
 * and unfurnished (the form has no switches for them; the unit's own screen changes them).
 * Optional fields left empty are left out, since the DTO refuses empty values.
 */
export function buildCreateUnitBody(input: NewUnit) {
  return {
    project_id: input.projectId,
    sub_project_id: input.subProjectId ?? undefined,
    unit_number: input.unitNumber.trim(),
    is_active: 1,
    is_broker: 0,
    is_eligible_for_rent: 0,
    is_locked: 0,
    unit_specifications: {
      unit_type_id: input.unitTypeId,
      location_id: input.locationId,
      total_area: input.totalArea,
      floor: input.floor ?? undefined,
      is_furnished: 0,
    },
  };
}

const createdUnitSchema = z.object({ unit_id: z.number().int() });

/**
 * Creates the unit and resolves with its id. The API refuses a unit number already used in the
 * same project and building (409), and a building outside the project.
 */
export async function createUnit(apiBaseUrl: string, input: NewUnit, locale: string): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/projects/units", buildCreateUnitBody(input), { locale });
  return parse(createdUnitSchema, result, "projects/units (create)").unit_id;
}

// POST /imports/units, GET /imports/:id, GET /imports/:id/errors

/** What the importer accepts (libs/core/src/imports/sheet-reader.ts, sheet-upload.ts). */
export const UNIT_IMPORT_EXTENSIONS = [".xlsx", ".xlsm", ".csv"] as const;
export const UNIT_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
/** The sheet's columns (`SHEET_COLUMNS.units`, libs/core/src/imports/import.types.ts). */
export const UNIT_IMPORT_COLUMNS = {
  required: ["unit_number"],
  optional: ["unit_type", "area", "floor", "sub_project", "address"],
} as const;

export type ImportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED";

const importStatus = z.enum(["PENDING", "PROCESSING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"]);

export type QueuedImport = {
  importId: number;
  status: ImportStatus;
  fileName: string;
  expectedColumns: { required: string[]; optional: string[] };
};

const queuedImportSchema = z.object({
  import_id: z.number().int(),
  status: importStatus,
  file_name: z.string(),
  expected_columns: z.object({ required: z.array(z.string()), optional: z.array(z.string()) }),
});

export function toQueuedImport(result: unknown): QueuedImport {
  const data = parse(queuedImportSchema, result, "imports/units");
  return {
    importId: data.import_id,
    status: data.status,
    fileName: data.file_name,
    expectedColumns: data.expected_columns,
  };
}

/** Why a file can't be sent, checked before upload with the importer's own limits. */
export function unitImportFileProblem(file: { name: string; size: number }): "type" | "size" | null {
  const name = file.name.toLowerCase();
  if (!UNIT_IMPORT_EXTENSIONS.some((extension) => name.endsWith(extension))) return "type";
  if (file.size > UNIT_IMPORT_MAX_BYTES) return "size";
  return null;
}

/** Queues `file` as the project's units sheet (multipart field `file`, plus `project_id`). */
export async function importUnits(
  apiBaseUrl: string,
  projectId: number,
  file: File,
  locale: string,
): Promise<QueuedImport> {
  const form = new FormData();
  form.append("project_id", String(projectId));
  form.append("file", file);
  const result = await apiPost(apiBaseUrl, "/imports/units", form, { locale });
  return toQueuedImport(result);
}

export type ImportJob = {
  id: number;
  status: ImportStatus;
  fileName: string;
  totalRows: number | null;
  insertedRows: number | null;
  updatedRows: number | null;
  skippedRows: number | null;
  failedRows: number | null;
  hasErrorReport: boolean;
  /** The worker's own message when the whole import failed. */
  errorMessage: string | null;
  /** Cairo time as the API writes it, `YYYY-MM-DD, HH:mm`. */
  createdAt: string | null;
  finishedAt: string | null;
};

const rows = z.number().int().nullable();

const importJobSchema = z.object({
  id: z.number().int(),
  status: importStatus,
  file_name: z.string(),
  total_rows: rows,
  inserted_rows: rows,
  updated_rows: rows,
  skipped_rows: rows,
  failed_rows: rows,
  has_error_report: z.boolean(),
  error_message: z.string().nullable(),
  created_at: z.string().nullable(),
  finished_at: z.string().nullable(),
});

export function toImportJob(result: unknown): ImportJob {
  const data = parse(importJobSchema, result, "imports/:id");
  return {
    id: data.id,
    status: data.status,
    fileName: data.file_name,
    totalRows: data.total_rows,
    insertedRows: data.inserted_rows,
    updatedRows: data.updated_rows,
    skippedRows: data.skipped_rows,
    failedRows: data.failed_rows,
    hasErrorReport: data.has_error_report,
    errorMessage: data.error_message,
    createdAt: data.created_at,
    finishedAt: data.finished_at,
  };
}

export function isImportRunning(status: ImportStatus): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

export async function fetchImportJob(
  apiBaseUrl: string,
  importId: number,
  projectId: number,
  locale: string,
): Promise<ImportJob> {
  const result = await apiGet(apiBaseUrl, `/imports/${importId}`, { project_id: projectId }, { locale });
  return toImportJob(result);
}

/** The rejected rows as a file, for `useApiDownload`. */
export function importErrorReportRequest(importId: number, projectId: number): DownloadRequest {
  return { path: `/imports/${importId}/errors`, query: { project_id: projectId }, fallbackName: "import-errors.xlsx" };
}

// GET /projects/units (owned units only, for picking one)

export const OWNED_UNIT_SEARCH_LIMIT = 10;

/** Units with a current owner whose number contains `unitNumber`, across the reachable projects. */
export async function searchOwnedUnits(apiBaseUrl: string, unitNumber: string, locale: string): Promise<Unit[]> {
  const result = await apiGet(
    apiBaseUrl,
    "/projects/units",
    { unit_number: unitNumber.trim(), page: 1, limit: OWNED_UNIT_SEARCH_LIMIT },
    { locale },
  );
  return toUnitsPage(result).units.filter((unit) => unit.owners.length > 0);
}
