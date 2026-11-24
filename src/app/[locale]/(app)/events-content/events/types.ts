/** The event form's fields, as typed. */
export type EventFormValues = {
  titleEn: string;
  titleAr: string;
  /** The description in the page's language (`en_description` or `ar_description`). */
  description: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm`. */
  time: string;
  capacity: string;
  /** The location in the page's language (`en_location` or `ar_location`). */
  location: string;
  /** A project id, or "" for All Projects. */
  project: string;
  ticketingUrl: string;
  /** A newly picked image; null keeps the saved one when editing. */
  image: File | null;
};

/** Why a field can't be saved; each has a label (see `EVENT_FORM_ERROR_KEYS`). */
export type EventFormError = "required" | "tooLong" | "capacity" | "invalidUrl" | "imageType" | "imageTooLarge";

export type EventFormErrors = Partial<Record<keyof EventFormValues, EventFormError>>;

export type EventModalState = { mode: "create" } | { mode: "edit"; eventId: number } | null;
