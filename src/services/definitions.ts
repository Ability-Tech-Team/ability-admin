import { z } from "zod";
import { apiGet } from "@/src/lib/apiClient";

/**
 * The option lists the forms and filters pick from (`/admin/definitions/...`,
 * ability-crm-api/apps/community-admin/src/definitions, answers built by the CRM's shared
 * libs/domain/src/definitions/definitions.service.ts). Read-only. `project_id` picks one project
 * the user can reach; without it the API uses the user's sign-in project (every project for the
 * super admin). Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `DefinitionsAnswerError` when
 * an answer doesn't have the expected shape.
 */

export class DefinitionsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "DefinitionsAnswerError";
  }
}

/** One choice: its id and its name in the request's language. */
export type DefinitionOption = { id: number; name: string };

/** A complaint type belongs to a department. */
export type ComplaintTypeOption = DefinitionOption & { departmentId: number | null };

export type Dropdowns = {
  countries: DefinitionOption[];
  idTypes: DefinitionOption[];
  maritalStatuses: DefinitionOption[];
  religions: DefinitionOption[];
  customerTypes: DefinitionOption[];
  unitTypes: DefinitionOption[];
  /** Every location of the project, flattened: a child is named after its parents ("Tower A › Floor 2"). */
  locations: DefinitionOption[];
  subProjects: DefinitionOption[];
  departments: DefinitionOption[];
  invoiceTypes: DefinitionOption[];
  complaintTypes: ComplaintTypeOption[];
  complaintStatuses: DefinitionOption[];
  contactChannels: DefinitionOption[];
};

const row = z.object({
  id: z.number().int(),
  name: z.string().nullable().optional(),
  en_name: z.string().nullable().optional(),
  ar_name: z.string().nullable().optional(),
  department_id: z.number().int().nullable().optional(),
  project_code: z.string().nullable().optional(),
});
type Row = z.infer<typeof row>;

const rowName = (item: Row) => item.name || item.en_name || item.ar_name || item.project_code || String(item.id);

/**
 * A list read row by row: one row with an odd field is left out rather than taking every
 * form's choices down with it. A list that isn't an array at all is a broken answer.
 */
function rows(value: unknown, key: string): Row[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new DefinitionsAnswerError(`definitions/all-dropdowns (${key})`);
  return value.flatMap((item) => {
    const parsed = row.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

const options = (value: unknown, key: string): DefinitionOption[] =>
  rows(value, key).map((item) => ({ id: item.id, name: rowName(item) }));

type LocationNode = { id: number; name: string; children: LocationNode[] };

const locationNode: z.ZodType<LocationNode> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    name: z.string().nullable().transform((name) => name ?? ""),
    children: z.array(locationNode).optional().default([]),
  }),
) as z.ZodType<LocationNode>;

export function flattenLocations(nodes: LocationNode[], parents: string[] = []): DefinitionOption[] {
  return nodes.flatMap((node) => {
    const path = [...parents, node.name || String(node.id)];
    return [{ id: node.id, name: path.join(" › ") }, ...flattenLocations(node.children, path)];
  });
}

export function toDropdowns(result: unknown): Dropdowns {
  if (typeof result !== "object" || result === null) throw new DefinitionsAnswerError("definitions/all-dropdowns");
  const answer = result as Record<string, unknown>;
  const locations = z.array(locationNode).safeParse(answer.locations ?? []);
  if (!locations.success) throw new DefinitionsAnswerError("definitions/all-dropdowns (locations)");
  return {
    countries: options(answer.countries, "countries"),
    idTypes: options(answer.id_types, "id_types"),
    maritalStatuses: options(answer.marital_statuses, "marital_statuses"),
    religions: options(answer.religions, "religions"),
    customerTypes: options(answer.customer_types, "customer_types"),
    unitTypes: options(answer.unit_types, "unit_types"),
    locations: flattenLocations(locations.data),
    subProjects: options(answer.sub_projects, "sub_projects"),
    departments: options(answer.departments, "departments"),
    invoiceTypes: options(answer.invoice_types, "invoice_types"),
    complaintTypes: rows(answer.complain_types, "complain_types").map((item) => ({
      id: item.id,
      name: rowName(item),
      departmentId: item.department_id ?? null,
    })),
    complaintStatuses: options(answer.complain_statuses, "complain_statuses"),
    contactChannels: options(answer.contact_channels, "contact_channels"),
  };
}

/** GET /definitions/all-dropdowns: every list, for one project when `projectId` is given. */
export async function fetchDropdowns(apiBaseUrl: string, projectId: number | null, locale: string): Promise<Dropdowns> {
  const result = await apiGet(apiBaseUrl, "/definitions/all-dropdowns", { project_id: projectId ?? undefined }, { locale });
  return toDropdowns(result);
}

/** A service a request can order, with its listed price. */
export type ServiceOption = DefinitionOption & { departmentId: number | null; price: number };

const servicesSchema = z.object({
  services: z.array(
    z.object({
      id: z.number().int(),
      service_name: z.string().nullable().optional(),
      en_name: z.string().nullable().optional(),
      department_id: z.number().int().nullable().optional(),
      // Prisma's Decimal arrives as a string.
      price: z.union([z.number(), z.string()]).nullable().optional(),
    }),
  ),
});

export function toServiceOptions(result: unknown): ServiceOption[] {
  const parsed = servicesSchema.safeParse(result);
  if (!parsed.success) throw new DefinitionsAnswerError("definitions/services");
  return parsed.data.services.map((service) => {
    const price = Number(service.price ?? 0);
    return {
      id: service.id,
      name: service.service_name || service.en_name || String(service.id),
      departmentId: service.department_id ?? null,
      price: Number.isFinite(price) ? price : 0,
    };
  });
}

/** The most services one department offers that a form lists at once. */
export const SERVICE_OPTIONS_LIMIT = 500;

/** GET /definitions/services: a department's active services in one project. */
export async function fetchServiceOptions(
  apiBaseUrl: string,
  { projectId, departmentId }: { projectId: number; departmentId: number },
  locale: string,
): Promise<ServiceOption[]> {
  const result = await apiGet(
    apiBaseUrl,
    "/definitions/services",
    { project_id: projectId, department_id: departmentId, is_active: 1, page: 1, limit: SERVICE_OPTIONS_LIMIT },
    { locale },
  );
  return toServiceOptions(result);
}
