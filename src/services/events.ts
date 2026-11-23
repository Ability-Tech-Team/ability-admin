import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/apiClient";

/**
 * Community events (`/admin/content/events`, ability-crm-api/apps/community-admin/src/content:
 * `content.controller.ts`, answers built by `formatEvent` in `content.service.ts`). Each call
 * resolves with the adapted answer or throws: `ApiError` (src/lib/apiClient.ts) when the API
 * refuses or can't be reached, `EventsAnswerError` when an answer doesn't have the expected
 * shape. The API keeps no RSVPs, so an event has a capacity but no RSVP count.
 */

export class EventsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "EventsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new EventsAnswerError(route);
  return parsed.data;
}

/**
 * `projectEnums.ALL_PROJECTS` (libs/core/src/common/enums/shared.enum.ts): content shown in
 * every project's app. Only the Super Admin can post to it (400 otherwise).
 */
export const ALL_PROJECTS_ID = 1;

/** `CONTENT_IMAGE` in content-image.ts: one image, up to 5 MB. */
export const EVENT_IMAGE_MAX_MB = 5;
export const EVENT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export type CommunityEvent = {
  id: number;
  projectId: number;
  /** In the request's language. */
  projectName: string;
  enTitle: string;
  arTitle: string;
  enDescription: string | null;
  arDescription: string | null;
  /** `YYYY-MM-DD`, Cairo time. */
  date: string;
  /** `HH:mm`, Cairo time. */
  time: string;
  /** Null when there is no limit. */
  capacity: number | null;
  enLocation: string | null;
  arLocation: string | null;
  ticketingUrl: string | null;
  /** A short-lived signed link (the API's MediaUrlInterceptor), or null. */
  imageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

const eventSchema = z.object({
  id: z.number().int(),
  project: z.object({ id: z.number().int(), name: z.string().nullable().optional() }),
  en_title: z.string(),
  ar_title: z.string(),
  en_description: z.string().nullable(),
  ar_description: z.string().nullable(),
  event_date: z.string(),
  event_time: z.string(),
  capacity: z.number().int().nullable(),
  en_location: z.string().nullable(),
  ar_location: z.string().nullable(),
  ticketing_url: z.string().nullable(),
  image: z.object({ file_path: z.string().nullable() }).nullable(),
  is_published: z.union([z.literal(0), z.literal(1)]),
  published_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  events: z.array(eventSchema),
});

function toEventFields(data: z.infer<typeof eventSchema>): CommunityEvent {
  return {
    id: data.id,
    projectId: data.project.id,
    projectName: data.project.name ?? "",
    enTitle: data.en_title,
    arTitle: data.ar_title,
    enDescription: data.en_description,
    arDescription: data.ar_description,
    date: data.event_date,
    time: data.event_time,
    capacity: data.capacity,
    enLocation: data.en_location,
    arLocation: data.ar_location,
    ticketingUrl: data.ticketing_url,
    imageUrl: data.image?.file_path || null,
    published: data.is_published === 1,
    publishedAt: data.published_at,
    createdAt: data.created_at,
  };
}

export function toEvent(result: unknown): CommunityEvent {
  return toEventFields(parse(eventSchema, result, "event"));
}

export type EventsPage = { events: CommunityEvent[]; totalCount: number; totalPages: number };

export function toEventsPage(result: unknown): EventsPage {
  const data = parse(listSchema, result, "events");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    events: data.events.map(toEventFields),
  };
}

// GET /content/events

/** `GetEventsDto`: the search matches the titles and locations in both languages. */
export type EventsFilter = {
  search: string;
  /** Undefined lists every project the user can reach, plus All Projects content. */
  projectId?: number;
  /** Undefined lists both. */
  published?: boolean;
  /** `YYYY-MM-DD`, inclusive. */
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
};

export function eventsQuery({ search, projectId, published, fromDate, toDate, page, limit }: EventsFilter) {
  return {
    search: search.trim(),
    project_id: projectId,
    is_published: published === undefined ? undefined : published ? 1 : 0,
    from_date: fromDate,
    to_date: toDate,
    page,
    limit,
  };
}

export async function fetchEvents(
  apiBaseUrl: string,
  filter: EventsFilter,
  locale: string,
): Promise<EventsPage> {
  const result = await apiGet(apiBaseUrl, "/content/events", eventsQuery(filter), { locale });
  return toEventsPage(result);
}

// GET /content/events/:id

export async function fetchEvent(apiBaseUrl: string, id: number, locale: string): Promise<CommunityEvent> {
  const result = await apiGet(apiBaseUrl, `/content/events/${id}`, {}, { locale });
  return toEvent(result);
}

// POST /content/events and PUT /content/events/:id (form-data, AttachmentsInterceptor(CONTENT_IMAGE))

/** What `CreateEventDto` takes. The image is required on create. */
export type EventInput = {
  projectId: number;
  enTitle: string;
  arTitle: string;
  enDescription: string;
  arDescription: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm`. */
  time: string;
  /** Null for no limit; otherwise a whole number, 1 or more. */
  capacity: number | null;
  enLocation: string;
  arLocation: string;
  /** A full http(s) link; required by the API. */
  ticketingUrl: string;
  published: boolean;
  image: File;
};

/** The create request. Empty optional text is left out. */
export function buildCreateEventForm(input: EventInput): FormData {
  const form = new FormData();
  form.append("project_id", String(input.projectId));
  form.append("en_title", input.enTitle.trim());
  form.append("ar_title", input.arTitle.trim());
  if (input.enDescription.trim()) form.append("en_description", input.enDescription.trim());
  if (input.arDescription.trim()) form.append("ar_description", input.arDescription.trim());
  form.append("event_date", input.date);
  form.append("event_time", input.time);
  if (input.capacity !== null) form.append("capacity", String(input.capacity));
  if (input.enLocation.trim()) form.append("en_location", input.enLocation.trim());
  if (input.arLocation.trim()) form.append("ar_location", input.arLocation.trim());
  form.append("ticketing_url", input.ticketingUrl.trim());
  form.append("is_published", input.published ? "1" : "0");
  form.append("image", input.image);
  return form;
}

/**
 * What changes on an update (`UpdateEventDto`, every field optional). Only the given fields
 * are sent. Empty descriptions and locations are sent empty, which the API saves as null; the
 * capacity can't be cleared (form-data carries no null and the DTO wants 1 or more), so a null
 * capacity is left as it was. A new image replaces the old one.
 */
export type EventChanges = Partial<Omit<EventInput, "image">> & { image?: File };

export function buildUpdateEventForm(changes: EventChanges): FormData {
  const form = new FormData();
  if (changes.projectId !== undefined) form.append("project_id", String(changes.projectId));
  if (changes.enTitle !== undefined) form.append("en_title", changes.enTitle.trim());
  if (changes.arTitle !== undefined) form.append("ar_title", changes.arTitle.trim());
  if (changes.enDescription !== undefined) form.append("en_description", changes.enDescription.trim());
  if (changes.arDescription !== undefined) form.append("ar_description", changes.arDescription.trim());
  if (changes.date !== undefined) form.append("event_date", changes.date);
  if (changes.time !== undefined) form.append("event_time", changes.time);
  if (changes.capacity !== undefined && changes.capacity !== null) {
    form.append("capacity", String(changes.capacity));
  }
  if (changes.enLocation !== undefined) form.append("en_location", changes.enLocation.trim());
  if (changes.arLocation !== undefined) form.append("ar_location", changes.arLocation.trim());
  if (changes.ticketingUrl !== undefined) form.append("ticketing_url", changes.ticketingUrl.trim());
  if (changes.published !== undefined) form.append("is_published", changes.published ? "1" : "0");
  if (changes.image) form.append("image", changes.image);
  return form;
}

const createdSchema = z.object({ id: z.number().int() });

/** Resolves with the new event's id. 400 without an image (`EVENT_IMAGE_REQUIRED`). */
export async function createEvent(apiBaseUrl: string, input: EventInput, locale: string): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/content/events", buildCreateEventForm(input), { locale });
  return parse(createdSchema, result, "create event").id;
}

/** The API answers with a message only; reload to see the saved event. */
export async function updateEvent(
  apiBaseUrl: string,
  id: number,
  changes: EventChanges,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/content/events/${id}`, buildUpdateEventForm(changes), { locale });
}

/** Publishing (`is_published: 1`) or taking back to draft (`0`). */
export async function setEventPublished(
  apiBaseUrl: string,
  id: number,
  published: boolean,
  locale: string,
): Promise<void> {
  await updateEvent(apiBaseUrl, id, { published }, locale);
}

// DELETE /content/events/:id (a soft delete)

export async function deleteEvent(apiBaseUrl: string, id: number, locale: string): Promise<void> {
  await apiDelete(apiBaseUrl, `/content/events/${id}`, undefined, { locale });
}
