import {
  ALL_PROJECTS_ID,
  EVENT_IMAGE_EXTENSIONS,
  EVENT_IMAGE_MAX_MB,
  type CommunityEvent,
  type EventChanges,
  type EventInput,
} from "@/src/services/events";
import type { EventFormErrors, EventFormValues } from "./types";

/**
 * The value of a multi-choice filter when exactly one is ticked. The API filters by one value
 * at a time, so with none or several ticked the filter isn't sent.
 */
export function singleChoice(selected: ReadonlySet<string>): string | null {
  return selected.size === 1 ? [...selected][0] : null;
}

/** The status filter's `published` / `draft`; both or neither lists every event. */
export function publishedFromStatusFilter(selected: ReadonlySet<string>): boolean | undefined {
  const choice = singleChoice(selected);
  return choice === "published" ? true : choice === "draft" ? false : undefined;
}

export function projectIdFromFilter(selected: ReadonlySet<string>): number | undefined {
  const id = Number(singleChoice(selected));
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function isArabic(locale: string): boolean {
  return locale === "ar";
}

/** The event's location in the page's language, else the other one. */
export function locationIn(event: CommunityEvent, locale: string): string | null {
  return (isArabic(locale) ? event.arLocation || event.enLocation : event.enLocation || event.arLocation) || null;
}

export function emptyEventForm(): EventFormValues {
  return {
    titleEn: "",
    titleAr: "",
    description: "",
    date: "",
    time: "",
    capacity: "",
    location: "",
    project: "",
    ticketingUrl: "",
    image: null,
  };
}

export function eventToForm(event: CommunityEvent, locale: string): EventFormValues {
  return {
    titleEn: event.enTitle,
    titleAr: event.arTitle,
    description: (isArabic(locale) ? event.arDescription : event.enDescription) ?? "",
    date: event.date,
    time: event.time,
    capacity: event.capacity === null ? "" : String(event.capacity),
    location: (isArabic(locale) ? event.arLocation : event.enLocation) ?? "",
    project: event.projectId === ALL_PROJECTS_ID ? "" : String(event.projectId),
    ticketingUrl: event.ticketingUrl ?? "",
    image: null,
  };
}

/** `CreateEventDto`'s limits. */
const TITLE_MAX = 255;
const DESCRIPTION_MAX = 5000;
const LOCATION_MAX = 255;
const TICKETING_URL_MAX = 2048;

/** A full http(s) link to a real domain, as the API's `IsUrl` takes it. */
export function isTicketingUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return (url.protocol === "http:" || url.protocol === "https:") && /^[^.]+(\.[^.]+)+$/.test(url.hostname);
  } catch {
    return false;
  }
}

/** Why the image can't be uploaded, by `CONTENT_IMAGE`. */
export function checkEventImage(file: Pick<File, "name" | "size">): "imageType" | "imageTooLarge" | null {
  const dot = file.name.lastIndexOf(".");
  const extension = dot === -1 ? "" : file.name.slice(dot).toLowerCase();
  if (!(EVENT_IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return "imageType";
  return file.size > EVENT_IMAGE_MAX_MB * 1024 * 1024 ? "imageTooLarge" : null;
}

/**
 * Checks the form as `CreateEventDto` (`event` null) or `UpdateEventDto` would. The ticketing
 * link can't be cleared once saved, but an older event without one may stay so.
 */
export function validateEventForm(values: EventFormValues, event: CommunityEvent | null): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!values.titleEn.trim()) errors.titleEn = "required";
  else if (values.titleEn.trim().length > TITLE_MAX) errors.titleEn = "tooLong";
  if (!values.titleAr.trim()) errors.titleAr = "required";
  else if (values.titleAr.trim().length > TITLE_MAX) errors.titleAr = "tooLong";
  if (values.description.trim().length > DESCRIPTION_MAX) errors.description = "tooLong";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = "required";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) errors.time = "required";
  if (values.capacity.trim() && !/^[1-9]\d*$/.test(values.capacity.trim())) errors.capacity = "capacity";
  if (values.location.trim().length > LOCATION_MAX) errors.location = "tooLong";
  const link = values.ticketingUrl.trim();
  if (!link) {
    if (!event || event.ticketingUrl) errors.ticketingUrl = "required";
  } else if (link.length > TICKETING_URL_MAX) errors.ticketingUrl = "tooLong";
  else if (!isTicketingUrl(link)) errors.ticketingUrl = "invalidUrl";
  if (values.image) {
    const problem = checkEventImage(values.image);
    if (problem) errors.image = problem;
  } else if (!event) errors.image = "required";
  return errors;
}

/**
 * A new event; call it once `validateEventForm` finds nothing. The screen has one description
 * and one location box, and the residents' app shows each language's own text with no fallback,
 * so they are saved as both. Null without an image, which the API requires.
 */
export function buildEventInput(values: EventFormValues, published: boolean): EventInput | null {
  if (!values.image) return null;
  return {
    projectId: values.project ? Number(values.project) : ALL_PROJECTS_ID,
    enTitle: values.titleEn,
    arTitle: values.titleAr,
    enDescription: values.description,
    arDescription: values.description,
    date: values.date,
    time: values.time,
    capacity: values.capacity.trim() ? Number(values.capacity.trim()) : null,
    enLocation: values.location,
    arLocation: values.location,
    ticketingUrl: values.ticketingUrl,
    published,
    image: values.image,
  };
}

/**
 * What an edit changes, field by field, so untouched fields stay as they are. The description
 * and location are edited in the page's language; the other language follows only while both
 * were the same (as this screen creates them), so a text written elsewhere is kept. A cleared capacity can't be saved (see `buildUpdateEventForm`).
 */
export function eventChanges(
  event: CommunityEvent,
  values: EventFormValues,
  published: boolean,
  locale: string,
): EventChanges {
  const before = eventToForm(event, locale);
  const changes: EventChanges = {};
  if (values.titleEn.trim() !== before.titleEn) changes.enTitle = values.titleEn;
  if (values.titleAr.trim() !== before.titleAr) changes.arTitle = values.titleAr;
  if (values.description.trim() !== before.description) {
    const same = (event.enDescription ?? "") === (event.arDescription ?? "");
    if (isArabic(locale) || same) changes.arDescription = values.description;
    if (!isArabic(locale) || same) changes.enDescription = values.description;
  }
  if (values.date !== before.date) changes.date = values.date;
  if (values.time !== before.time) changes.time = values.time;
  if (values.capacity.trim() && values.capacity.trim() !== before.capacity) {
    changes.capacity = Number(values.capacity.trim());
  }
  if (values.location.trim() !== before.location) {
    const same = (event.enLocation ?? "") === (event.arLocation ?? "");
    if (isArabic(locale) || same) changes.arLocation = values.location;
    if (!isArabic(locale) || same) changes.enLocation = values.location;
  }
  if (values.project !== before.project) {
    changes.projectId = values.project ? Number(values.project) : ALL_PROJECTS_ID;
  }
  if (values.ticketingUrl.trim() !== before.ticketingUrl) changes.ticketingUrl = values.ticketingUrl;
  if (values.image) changes.image = values.image;
  if (published !== event.published) changes.published = published;
  return changes;
}
