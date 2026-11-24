import { z } from "zod";
import { apiGet, apiPost, apiPut } from "@/src/lib/apiClient";

/**
 * Projects (`/admin/projects`, ability-crm-api/apps/community-admin/src/projects, answers
 * built by libs/domain/src/company-projects/company-projects.service.ts). Super Admin only:
 * other roles get 403. The pickers' list, `GET /admin/projects/accessible`
 * (`fetchProjectOptions`), is open to every employee. Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `ProjectsAnswerError` when
 * an answer doesn't have the expected shape.
 */

export class ProjectsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "ProjectsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new ProjectsAnswerError(route);
  return parsed.data;
}

/** `projectTypeEnums` in libs/core/src/common/enums/shared.enum.ts. */
export const PROJECT_TYPES = ["RESIDENTIAL", "COMMERCIAL", "MIXED"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export function isProjectType(value: string | null): value is ProjectType {
  return value !== null && (PROJECT_TYPES as readonly string[]).includes(value);
}

/** One corner of the project's map boundary; the API takes exactly four. */
export type BoundaryPoint = { lat: number; lng: number };

export type Project = {
  id: number;
  /** In the request's language. */
  name: string;
  enName: string;
  arName: string;
  companyCode: string;
  /** Fixed once the project is created. */
  projectCode: string;
  active: boolean;
  /** One of `PROJECT_TYPES`, or whatever older rows hold; null when not set. */
  type: string | null;
  location: string | null;
  googleMapsLink: string | null;
  boundary: BoundaryPoint[] | null;
  managerName: string | null;
};

export type ProjectListItem = Project & {
  /** Active units. */
  totalUnits: number;
  /** Occupied units as a percentage of the active units (0-100). */
  occupancy: number;
};

const activeFlag = z.union([z.literal(0), z.literal(1)]);
const point = z.object({ lat: z.number(), lng: z.number() });

const projectSchema = z.object({
  id: z.number().int(),
  // `project[`${lang}_name`]`: missing when the request's language is neither en nor ar.
  name: z.string().optional(),
  en_name: z.string(),
  ar_name: z.string(),
  company_code: z.string(),
  project_code: z.string(),
  is_active: activeFlag,
  type: z.string().nullable(),
  location: z.string().nullable(),
  google_maps_link: z.string().nullable(),
  boundary: z.array(point).nullable(),
  manager_name: z.string().nullable(),
});

const listItemSchema = projectSchema.extend({
  total_units: z.number().int().nonnegative(),
  occupancy: z.number(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  projects: z.array(listItemSchema),
});

function toProjectFields(data: z.infer<typeof projectSchema>): Project {
  return {
    id: data.id,
    name: data.name ?? data.en_name,
    enName: data.en_name,
    arName: data.ar_name,
    companyCode: data.company_code,
    projectCode: data.project_code,
    active: data.is_active === 1,
    type: data.type,
    location: data.location,
    googleMapsLink: data.google_maps_link,
    boundary: data.boundary,
    managerName: data.manager_name,
  };
}

export function toProject(result: unknown): Project {
  return toProjectFields(parse(projectSchema, result, "project"));
}

export type ProjectsPage = { projects: ProjectListItem[]; totalCount: number; totalPages: number };

export function toProjectsPage(result: unknown): ProjectsPage {
  const data = parse(listSchema, result, "projects");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    projects: data.projects.map((project) => ({
      ...toProjectFields(project),
      totalUnits: project.total_units,
      occupancy: project.occupancy,
    })),
  };
}

/**
 * Sample project names for the screens not connected to the API yet (events, users). TODO:
 * replace with `fetchProjectOptions`, loaded in the browser, when those screens are connected.
 */
export async function fetchProjectFilterOptions(): Promise<{ value: string; label: string }[]> {
  const names = ["Marina Heights", "Palm Residences", "Corniche Gardens", "Downtown Towers", "Business Bay Complex"];
  return names.map((name) => ({ value: name.toLowerCase().replace(/\s+/g, "-"), label: name }));
}

// GET /projects

/** `GetCompanyProjectsDto`: the search matches the English or Arabic name. */
export type ProjectsFilter = {
  search: string;
  /** The whole name, not part of it (`is_exact`); only sent with a search. */
  exact?: boolean;
  /** Undefined lists both. */
  active?: boolean;
  page: number;
  limit: number;
};

export function projectsQuery({ search, exact, active, page, limit }: ProjectsFilter) {
  const term = search.trim();
  return {
    search: term,
    is_exact: term && exact ? 1 : undefined,
    is_active: active === undefined ? undefined : active ? 1 : 0,
    page,
    limit,
  };
}

export async function fetchProjects(
  apiBaseUrl: string,
  filter: ProjectsFilter,
  locale: string,
): Promise<ProjectsPage> {
  const result = await apiGet(apiBaseUrl, "/projects", projectsQuery(filter), { locale });
  return toProjectsPage(result);
}

/** A project to pick in a filter or a form. The one project list every screen's pickers use. */
export type ProjectOption = { id: number; name: string; active: boolean };

/**
 * Only what a picker needs, so one project with an odd field (say a missing Arabic name) can't
 * take every screen's project filter down with it, as the full list's stricter parse would.
 */
const optionsSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    en_name: z.string(),
    is_active: activeFlag,
  }),
);

/** `GET /projects/accessible` (ProjectService.getAccessibleProjects in libs/domain/src/project). */
export function toProjectOptions(result: unknown): ProjectOption[] {
  const parsed = optionsSchema.safeParse(result);
  if (!parsed.success) throw new ProjectsAnswerError("projects/accessible");
  return parsed.data.map((project) => ({
    id: project.id,
    name: project.name || project.en_name,
    active: project.is_active === 1,
  }));
}

/**
 * The projects the signed-in employee can work in (or only the active ones), for pickers. Open to
 * every employee: all projects for the Super Admin, else the sign-in project plus the other
 * projects the employee was given access to.
 */
export async function fetchProjectOptions(
  apiBaseUrl: string,
  { activeOnly }: { activeOnly: boolean },
  locale: string,
): Promise<ProjectOption[]> {
  const result = await apiGet(apiBaseUrl, "/projects/accessible", {}, { locale });
  const options = toProjectOptions(result);
  return activeOnly ? options.filter((project) => project.active) : options;
}

// POST /projects and PUT /projects/:id (form-data, AttachmentsInterceptor(PROJECT_FILES))

/**
 * What the project form saves (`CreateCompanyProjectDto`). The profile (descriptions, website,
 * publishing), amenities and files the DTO also takes have no fields on this screen.
 */
export type ProjectInput = {
  enName: string;
  arName: string;
  companyCode: string;
  type: ProjectType | null;
  location: string;
  googleMapsLink: string;
  managerName: string;
  /** Exactly four corners, or null for none. */
  boundary: BoundaryPoint[] | null;
};

/**
 * The create request. Form-data carries text only, so the boundary goes as one JSON field and
 * empty optional fields are left out.
 */
export function buildCreateProjectForm(input: ProjectInput & { projectCode: string }): FormData {
  const form = new FormData();
  form.append("en_name", input.enName.trim());
  form.append("ar_name", input.arName.trim());
  form.append("company_code", input.companyCode.trim());
  form.append("project_code", input.projectCode.trim());
  if (input.type) form.append("type", input.type);
  if (input.location.trim()) form.append("location", input.location.trim());
  if (input.googleMapsLink.trim()) form.append("google_maps_link", input.googleMapsLink.trim());
  if (input.managerName.trim()) form.append("manager_name", input.managerName.trim());
  if (input.boundary) form.append("boundary", JSON.stringify(input.boundary));
  return form;
}

/**
 * The update request (`UpdateCompanyProjectDto`, which can't change `project_code`). Every
 * field is sent so a cleared one is cleared: an empty link becomes null, the boundary's JSON
 * `null` removes it, and empty text is saved empty. The type can't be cleared: form-data can't
 * carry null and the DTO refuses an empty value, so an unset type is left as it was.
 */
export function buildUpdateProjectForm(input: ProjectInput): FormData {
  const form = new FormData();
  form.append("en_name", input.enName.trim());
  form.append("ar_name", input.arName.trim());
  form.append("company_code", input.companyCode.trim());
  if (input.type) form.append("type", input.type);
  form.append("location", input.location.trim());
  form.append("google_maps_link", input.googleMapsLink.trim());
  form.append("manager_name", input.managerName.trim());
  form.append("boundary", JSON.stringify(input.boundary));
  return form;
}

/** Turning a project on or off. The main project (id 2) can't be turned off (400). */
export function buildProjectStatusForm(active: boolean): FormData {
  const form = new FormData();
  form.append("is_active", active ? "1" : "0");
  return form;
}

/** Resolves with the saved project. 409 when the codes and a name match another project. */
export async function createProject(
  apiBaseUrl: string,
  input: ProjectInput & { projectCode: string },
  locale: string,
): Promise<Project> {
  const result = await apiPost(apiBaseUrl, "/projects", buildCreateProjectForm(input), { locale });
  return toProject(result);
}

export async function updateProject(
  apiBaseUrl: string,
  id: number,
  input: ProjectInput,
  locale: string,
): Promise<Project> {
  const result = await apiPut(apiBaseUrl, `/projects/${id}`, buildUpdateProjectForm(input), {
    locale,
  });
  return toProject(result);
}

export async function setProjectActive(
  apiBaseUrl: string,
  id: number,
  active: boolean,
  locale: string,
): Promise<Project> {
  const result = await apiPut(apiBaseUrl, `/projects/${id}`, buildProjectStatusForm(active), {
    locale,
  });
  return toProject(result);
}
