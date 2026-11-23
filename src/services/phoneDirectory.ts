import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/apiClient";

/**
 * The community phone directory (`/admin/content/phone-directory`,
 * ability-crm-api/apps/community-admin/src/content, answers built by `ContentService` there).
 * Requests are JSON. Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `PhoneDirectoryAnswerError`
 * when an answer doesn't have the expected shape.
 *
 * A contact has an English and an Arabic name, a number, a project (or "All Projects", id 1,
 * which only the Super Admin can write to), a sort order and a published flag. It has no
 * category on the API.
 */

export class PhoneDirectoryAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "PhoneDirectoryAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new PhoneDirectoryAnswerError(route);
  return parsed.data;
}

/** `CreatePhoneContactDto` limits. */
export const PHONE_CONTACT_NAME_MAX = 100;
/** What the app dials: an optional +, then 3-15 digits; the API drops spaces and dashes first. */
export const PHONE_NUMBER_PATTERN = /^\+?\d{3,15}$/;

export function normalizePhoneNumber(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_PATTERN.test(normalizePhoneNumber(value));
}

export type PhoneContact = {
  id: number;
  projectId: number;
  /** In the request's language; null when the project has no name in it. */
  projectName: string | null;
  nameEn: string;
  nameAr: string;
  phone: string;
  sortOrder: number;
  published: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

export type PhoneDirectoryPage = { contacts: PhoneContact[]; totalCount: number; totalPages: number };

const contactSchema = z.object({
  id: z.number().int(),
  project: z.object({ id: z.number().int(), name: z.string().nullable().optional() }),
  en_name: z.string(),
  ar_name: z.string(),
  phone_number: z.string(),
  sort_order: z.number().int(),
  is_published: z.number().int(),
  published_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  phone_directory: z.array(contactSchema),
});

function toContactFields(data: z.infer<typeof contactSchema>): PhoneContact {
  return {
    id: data.id,
    projectId: data.project.id,
    projectName: data.project.name ?? null,
    nameEn: data.en_name,
    nameAr: data.ar_name,
    phone: data.phone_number,
    sortOrder: data.sort_order,
    published: data.is_published === 1,
    publishedAt: data.published_at,
    createdAt: data.created_at,
  };
}

export function toPhoneContact(result: unknown): PhoneContact {
  return toContactFields(parse(contactSchema, result, "phone contact"));
}

export function toPhoneDirectoryPage(result: unknown): PhoneDirectoryPage {
  const data = parse(listSchema, result, "phone directory");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    contacts: data.phone_directory.map(toContactFields),
  };
}

// GET /content/phone-directory

/** `GetContentItemsDto`: the search matches either name or the number. */
export type PhoneDirectoryFilter = {
  search: string;
  /** One project, or 1 for "All Projects"; null for every project. */
  projectId?: number | null;
  /** Undefined lists both. */
  published?: boolean;
  page: number;
  limit: number;
};

export function phoneDirectoryQuery({ search, projectId, published, page, limit }: PhoneDirectoryFilter) {
  return {
    search: search.trim(),
    project_id: projectId ?? undefined,
    is_published: published === undefined ? undefined : published ? 1 : 0,
    page,
    limit,
  };
}

export async function fetchPhoneDirectory(
  apiBaseUrl: string,
  filter: PhoneDirectoryFilter,
  locale: string,
): Promise<PhoneDirectoryPage> {
  const result = await apiGet(apiBaseUrl, "/content/phone-directory", phoneDirectoryQuery(filter), {
    locale,
  });
  return toPhoneDirectoryPage(result);
}

export async function fetchPhoneContact(apiBaseUrl: string, id: number, locale: string): Promise<PhoneContact> {
  return toPhoneContact(await apiGet(apiBaseUrl, `/content/phone-directory/${id}`, {}, { locale }));
}

// POST /content/phone-directory, PUT and DELETE /content/phone-directory/:id

export type PhoneContactInput = {
  projectId: number;
  nameEn: string;
  nameAr: string;
  phone: string;
  published: boolean;
};

/** `CreatePhoneContactDto`. The sort order is left to the API (0). */
export function buildPhoneContactBody(input: PhoneContactInput) {
  return {
    project_id: input.projectId,
    en_name: input.nameEn.trim(),
    ar_name: input.nameAr.trim(),
    phone_number: normalizePhoneNumber(input.phone),
    is_published: input.published ? 1 : 0,
  };
}

/** `UpdatePhoneContactDto` (every field optional): only what is given is sent. */
export function buildPhoneContactUpdateBody(input: Partial<PhoneContactInput>) {
  return {
    ...(input.projectId !== undefined && { project_id: input.projectId }),
    ...(input.nameEn !== undefined && { en_name: input.nameEn.trim() }),
    ...(input.nameAr !== undefined && { ar_name: input.nameAr.trim() }),
    ...(input.phone !== undefined && { phone_number: normalizePhoneNumber(input.phone) }),
    ...(input.published !== undefined && { is_published: input.published ? 1 : 0 }),
  };
}

const createdSchema = z.object({ id: z.number().int() });

export async function createPhoneContact(
  apiBaseUrl: string,
  input: PhoneContactInput,
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/content/phone-directory", buildPhoneContactBody(input), {
    locale,
  });
  return parse(createdSchema, result, "phone contact (created)").id;
}

export async function updatePhoneContact(
  apiBaseUrl: string,
  id: number,
  input: Partial<PhoneContactInput>,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/content/phone-directory/${id}`, buildPhoneContactUpdateBody(input), {
    locale,
  });
}

export async function deletePhoneContact(apiBaseUrl: string, id: number, locale: string): Promise<void> {
  await apiDelete(apiBaseUrl, `/content/phone-directory/${id}`, undefined, { locale });
}
