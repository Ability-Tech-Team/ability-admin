import { ALL_PROJECTS_ID, type CommunityEvent, type EventChanges } from "@/src/services/events";
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
  return { titleEn: "", titleAr: "", description: "", date: "", time: "", capacity: "", location: "", project: "" };
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
  };
}

/** `CreateEventDto`'s limits. */
const TITLE_MAX = 255;
const DESCRIPTION_MAX = 5000;
const LOCATION_MAX = 255;

/** Checks the form as `UpdateEventDto` would. */
export function validateEventForm(values: EventFormValues): EventFormErrors {
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
  return errors;
}

/**
 * What an edit changes, field by field, so text in the other language and untouched fields
 * stay as they are. A cleared capacity can't be saved (see `buildUpdateEventForm`).
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
    if (isArabic(locale)) changes.arDescription = values.description;
    else changes.enDescription = values.description;
  }
  if (values.date !== before.date) changes.date = values.date;
  if (values.time !== before.time) changes.time = values.time;
  if (values.capacity.trim() && values.capacity.trim() !== before.capacity) {
    changes.capacity = Number(values.capacity.trim());
  }
  if (values.location.trim() !== before.location) {
    if (isArabic(locale)) changes.arLocation = values.location;
    else changes.enLocation = values.location;
  }
  if (values.project !== before.project) {
    changes.projectId = values.project ? Number(values.project) : ALL_PROJECTS_ID;
  }
  if (published !== event.published) changes.published = published;
  return changes;
}
