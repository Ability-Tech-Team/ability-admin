import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut, type ApiQuery, type DownloadRequest } from "@/src/lib/apiClient";

/**
 * Customers (`/admin/customers`, ability-crm-api/apps/community-admin/src/customers, answers
 * built by libs/domain/src/customers/customer-shared.service.ts), the project options the
 * customer screens filter and save with (`GET /admin/projects`, Super Admin only), and the
 * spreadsheet imports of customers and relatives (`/admin/imports`,
 * libs/domain/src/imports). Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `CustomersAnswerError` when
 * an answer doesn't have the expected shape.
 */

export class CustomersAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "CustomersAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new CustomersAnswerError(route);
  return parsed.data;
}

/** Rows per page on the customers list. */
export const CUSTOMERS_PAGE_SIZE = 20;

// No admin route lists the choices a customer is saved with (id types, countries, customer types,
// marital statuses, religions); a customer's answer carries its own, by id and name.

/** `ownership_types` (`ownerShipTypeEnums`): what a customer is on a unit; the list filters by it. */
export const OWNERSHIP_IDS = { owner: 1, renter: 2, ownerRelative: 3 } as const;

const id = z.number().int();
const text = z.string().nullable();
const flag = z.number().int().nullable();

// ---- Answers

const customerUnitSchema = z.object({
  is_active: flag,
  is_deleted: flag,
  ownership_id: id.nullable(),
  ownership: text.optional(),
  unit_details: z.object({
    id,
    unit_number: z.string(),
    project_id: id,
    project_name: text,
  }),
});

const attachmentSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  // MediaUrlInterceptor swaps the stored key for a short-lived signed link.
  file_path: z.string(),
  created_at: text,
});

const customerSchema = z.object({
  id,
  customer_name: z.string(),
  customer_code: text,
  id_type: id,
  id_type_name: text,
  id_number: z.string(),
  email: text,
  mobile_number: text,
  country_id: id.nullable(),
  country_name: text,
  customer_type_id: id.nullable(),
  customer_type_name: text,
  marital_status_id: id.nullable(),
  marital_status_name: text,
  religion_id: id.nullable(),
  religion_name: text,
  is_active: flag,
  // A database timestamp holding Cairo clock time, serialized as ISO.
  created_at: text,
  customer_units: z.array(customerUnitSchema),
  attachments: z.array(attachmentSchema),
});

const customersListSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  customers: z.array(customerSchema),
});

const customerDetailSchema = customerSchema.extend({
  projects: z.array(z.object({ id, name: text })),
});

export type Named = { id: number; name: string | null };

export type CustomerUnit = {
  unitId: number;
  unitNumber: string;
  projectId: number;
  projectName: string | null;
  /** `OWNERSHIP_IDS`: owner, renter or owner's relative. */
  ownershipId: number | null;
  /** In the request's language. */
  ownershipName: string | null;
  active: boolean;
};

export type CustomerAttachment = {
  id: string;
  fileName: string;
  /** A signed link that expires; open it soon after loading. */
  url: string;
  /** `YYYY-MM-DD, HH:mm`, Cairo time. */
  createdAt: string | null;
};

export type Customer = {
  id: number;
  name: string;
  code: string | null;
  idTypeId: number;
  /** In the request's language. */
  idTypeName: string | null;
  idNumber: string;
  email: string | null;
  mobile: string | null;
  countryId: number | null;
  /** The country (the API gives no nationality wording). */
  countryName: string | null;
  customerTypeId: number | null;
  customerTypeName: string | null;
  maritalStatusId: number | null;
  maritalStatusName: string | null;
  religionId: number | null;
  religionName: string | null;
  active: boolean;
  /** `YYYY-MM-DD`: the day the record was created. */
  createdOn: string | null;
  /** The customer's live links to units in the projects the user can reach. */
  units: CustomerUnit[];
  attachments: CustomerAttachment[];
};

export type CustomerDetail = Customer & {
  /** The projects (that the user can reach) the customer belongs to. */
  projects: Named[];
};

export type CustomersPage = { customers: Customer[]; totalCount: number; totalPages: number };

function toCustomer(customer: z.infer<typeof customerSchema>): Customer {
  return {
    id: customer.id,
    name: customer.customer_name,
    code: customer.customer_code,
    idTypeId: customer.id_type,
    idTypeName: customer.id_type_name,
    idNumber: customer.id_number,
    email: customer.email,
    mobile: customer.mobile_number,
    countryId: customer.country_id,
    countryName: customer.country_name,
    customerTypeId: customer.customer_type_id,
    customerTypeName: customer.customer_type_name,
    maritalStatusId: customer.marital_status_id,
    maritalStatusName: customer.marital_status_name,
    religionId: customer.religion_id,
    religionName: customer.religion_name,
    active: customer.is_active === 1,
    createdOn: customer.created_at ? customer.created_at.slice(0, 10) : null,
    units: customer.customer_units
      // The list doesn't leave out deleted links; nobody lives in them any more.
      .filter((link) => link.is_deleted !== 1)
      .map((link) => ({
        unitId: link.unit_details.id,
        unitNumber: link.unit_details.unit_number,
        projectId: link.unit_details.project_id,
        projectName: link.unit_details.project_name,
        ownershipId: link.ownership_id,
        ownershipName: link.ownership ?? null,
        active: link.is_active === 1,
      })),
    attachments: customer.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.file_name,
      url: attachment.file_path,
      createdAt: attachment.created_at,
    })),
  };
}

export function toCustomersPage(result: unknown): CustomersPage {
  const data = parse(customersListSchema, result, "customers");
  return {
    customers: data.customers.map(toCustomer),
    totalCount: data.total_count,
    totalPages: data.total_pages,
  };
}

export function toCustomerDetail(result: unknown): CustomerDetail {
  const data = parse(customerDetailSchema, result, "customer");
  return { ...toCustomer(data), projects: data.projects };
}

// ---- GET /customers

/** Which field the search box looks in: the API searches one at a time. */
export type CustomerSearchField = "name" | "mobile" | "idNumber" | "unit" | "code";

export type CustomerFilters = {
  search: string;
  searchField: CustomerSearchField;
  projectId: number | null;
  /** `OWNERSHIP_IDS`: customers with a link of this kind. */
  ownershipId: number | null;
};

/**
 * `GetCustomersDto`. The name and mobile match part of the value; the ID number, unit number
 * and customer code match it whole.
 */
const searchParam: Record<CustomerSearchField, string> = {
  name: "customer_name",
  mobile: "mobile_number",
  idNumber: "id_number",
  unit: "unit_number",
  code: "customer_code",
};

export function customersQuery(filters: CustomerFilters): ApiQuery {
  return {
    [searchParam[filters.searchField]]: filters.search.trim(),
    project_id: filters.projectId,
    ownership_id: filters.ownershipId,
  };
}

/** One page of customers, newest first. */
export async function fetchCustomers(
  apiBaseUrl: string,
  filters: CustomerFilters,
  page: number,
  locale: string,
): Promise<CustomersPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/customers",
    { ...customersQuery(filters), page, limit: CUSTOMERS_PAGE_SIZE },
    { locale },
  );
  return toCustomersPage(result);
}

/** The customers matching the filters as a spreadsheet (`is_excel=1`), for `useApiDownload`. */
export function customersSheetRequest(filters: CustomerFilters): DownloadRequest {
  return { path: "/customers", query: { ...customersQuery(filters), is_excel: 1 }, fallbackName: "customers.xlsx" };
}

// ---- GET /customers/:id

export async function fetchCustomer(apiBaseUrl: string, customerId: number, locale: string): Promise<CustomerDetail> {
  const result = await apiGet(apiBaseUrl, `/customers/${customerId}`, {}, { locale });
  return toCustomerDetail(result);
}

// ---- POST /customers, PUT /customers/:id, DELETE /customers/:id

/** `CreateCustomerDto`, the fields this app sends. */
export type CreateCustomerBody = {
  project_id: number;
  customer_name: string;
  country_id: number;
  id_type: number;
  id_number: string;
  marital_status_id: number;
  religion_id: number;
  customer_type_id: number;
  mobile_number?: string;
  email?: string;
};

/** `UpdateCustomerDto`, the fields this app changes. */
export type UpdateCustomerBody = Partial<Omit<CreateCustomerBody, "project_id">> & { is_active?: 0 | 1 };

const createdSchema = z.object({ id });

/**
 * Creates the customer in the project. An ID number that already belongs to a customer of
 * another project links that customer to this one, unchanged; one already in the project is
 * refused (409).
 */
export async function createCustomer(
  apiBaseUrl: string,
  body: CreateCustomerBody,
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/customers", body, { locale });
  return parse(createdSchema, result, "create customer").id;
}

export async function updateCustomer(
  apiBaseUrl: string,
  customerId: number,
  body: UpdateCustomerBody,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/customers/${customerId}`, body, { locale });
}

const deletedSchema = z.object({ is_customer_deleted: z.boolean() });

/**
 * Removes the customer from one project (`DeleteCustomerDto.project_id`, required here).
 * Resolves true when that was their last project and the customer itself was deleted, false
 * when they stay a customer of another project. Refused (409) while they hold an active unit
 * or have pending relative requests there.
 */
export async function deleteCustomer(
  apiBaseUrl: string,
  customerId: number,
  projectId: number,
  locale: string,
): Promise<boolean> {
  const result = await apiDelete(apiBaseUrl, `/customers/${customerId}`, { project_id: projectId }, { locale });
  return parse(deletedSchema, result, "delete customer").is_customer_deleted;
}

// ---- POST /imports/customers | /imports/relatives, GET /imports/:id

export type ImportKind = "customers" | "relatives";

export type QueuedImport = {
  importId: number;
  fileName: string;
  requiredColumns: string[];
  optionalColumns: string[];
};

const queuedSchema = z.object({
  import_id: id,
  file_name: z.string(),
  expected_columns: z.object({ required: z.array(z.string()), optional: z.array(z.string()) }),
});

export function toQueuedImport(result: unknown): QueuedImport {
  const data = parse(queuedSchema, result, "import");
  return {
    importId: data.import_id,
    fileName: data.file_name,
    requiredColumns: data.expected_columns.required,
    optionalColumns: data.expected_columns.optional,
  };
}

/**
 * Queues a spreadsheet (.xlsx, .xlsm or .csv, at most 5 MB) for the import worker. The upload
 * goes to one project, which the admin API needs named.
 */
export async function importSheet(
  apiBaseUrl: string,
  kind: ImportKind,
  projectId: number,
  file: File,
  locale: string,
): Promise<QueuedImport> {
  const form = new FormData();
  form.append("project_id", String(projectId));
  form.append("file", file);
  const result = await apiPost(apiBaseUrl, `/imports/${kind}`, form, { locale });
  return toQueuedImport(result);
}

export type ImportJob = {
  id: number;
  status: ImportStatus;
  totalRows: number | null;
  insertedRows: number | null;
  updatedRows: number | null;
  skippedRows: number | null;
  failedRows: number | null;
  hasErrorReport: boolean;
  errorMessage: string | null;
};

/** `IMPORT_STATUS` in libs/core/src/imports/import.types.ts. */
export const IMPORT_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];

const rows = z.number().int().nullable();

const importJobSchema = z.object({
  id,
  status: z.enum(IMPORT_STATUSES),
  total_rows: rows,
  inserted_rows: rows,
  updated_rows: rows,
  skipped_rows: rows,
  failed_rows: rows,
  has_error_report: z.boolean(),
  error_message: text,
});

export function toImportJob(result: unknown): ImportJob {
  const data = parse(importJobSchema, result, "import job");
  return {
    id: data.id,
    status: data.status,
    totalRows: data.total_rows,
    insertedRows: data.inserted_rows,
    updatedRows: data.updated_rows,
    skippedRows: data.skipped_rows,
    failedRows: data.failed_rows,
    hasErrorReport: data.has_error_report,
    errorMessage: data.error_message,
  };
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

/** The rows the import refused, as a spreadsheet, for `useApiDownload`. */
export function importErrorsRequest(importId: number, projectId: number): DownloadRequest {
  return { path: `/imports/${importId}/errors`, query: { project_id: projectId }, fallbackName: "import-errors.xlsx" };
}
