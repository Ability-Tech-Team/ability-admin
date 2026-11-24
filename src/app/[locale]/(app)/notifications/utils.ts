import {
  NOTIFICATION_BODY_MAX,
  NOTIFICATION_IMAGE_EXTENSIONS,
  NOTIFICATION_IMAGE_MAX_MB,
  NOTIFICATION_TITLE_MAX,
  type SendNotificationInput,
  type SentNotification,
} from "@/src/services/notifications";
import type { NotificationFormErrors, NotificationFormValues } from "./types";

export function emptyNotificationForm(): NotificationFormValues {
  return {
    projectId: "",
    target: "all",
    enTitle: "",
    arTitle: "",
    enBody: "",
    arBody: "",
    image: null,
  };
}

/** What's wrong with a picked image, by the route's own limits. */
export function checkNotificationImage(file: { name: string; size: number }): "imageType" | "imageTooLarge" | null {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!(NOTIFICATION_IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return "imageType";
  if (file.size > NOTIFICATION_IMAGE_MAX_MB * 1024 * 1024) return "imageTooLarge";
  return null;
}

type Validated =
  | { ok: true; input: SendNotificationInput }
  | { ok: false; errors: NotificationFormErrors };

/** `SendNotificationDto`: a project, both titles and both bodies; the API checks them again. */
export function validateNotificationForm(values: NotificationFormValues): Validated {
  const errors: NotificationFormErrors = {};
  const projectId = Number(values.projectId);
  if (!values.projectId || !Number.isInteger(projectId)) errors.projectId = "required";

  const texts = [
    ["enTitle", NOTIFICATION_TITLE_MAX],
    ["arTitle", NOTIFICATION_TITLE_MAX],
    ["enBody", NOTIFICATION_BODY_MAX],
    ["arBody", NOTIFICATION_BODY_MAX],
  ] as const;
  for (const [field, max] of texts) {
    const text = values[field].trim();
    if (!text) errors[field] = "required";
    else if (text.length > max) errors[field] = "tooLong";
  }

  if (values.image) {
    const imageError = checkNotificationImage(values.image);
    if (imageError) errors.image = imageError;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    input: {
      projectId,
      target: values.target,
      enTitle: values.enTitle,
      arTitle: values.arTitle,
      enBody: values.enBody,
      arBody: values.arBody,
      image: values.image,
    },
  };
}

// The sent notifications (Notifications and Delivery Logs tabs)

/** The title and body in the page's language, or the other language's when that one is empty. */
export function sentNotificationText(
  notification: Pick<SentNotification, "enTitle" | "arTitle" | "enBody" | "arBody">,
  locale: string,
): { title: string; body: string } {
  const arabic = locale === "ar";
  const pick = (en: string, ar: string) => (arabic ? ar || en : en || ar);
  return {
    title: pick(notification.enTitle, notification.arTitle),
    body: pick(notification.enBody, notification.arBody),
  };
}

const countFormat = new Intl.NumberFormat("en-US");

export function formatCount(value: number): string {
  return countFormat.format(value);
}

/** Read out of recipients, as a whole percentage; 0 when there were none. */
export function readPercent(readCount: number, sentCount: number): number {
  if (sentCount <= 0) return 0;
  return Math.min(100, Math.round((readCount / sentCount) * 100));
}

/** The Reach cell: `6 sent · 2 read (33%)`, with the catalog's words for "sent" and "read". */
export function formatReach(
  { sentCount, readCount }: Pick<SentNotification, "sentCount" | "readCount">,
  words: { sent: string; read: string },
): string {
  return `${formatCount(sentCount)} ${words.sent} · ${formatCount(readCount)} ${words.read} (${readPercent(readCount, sentCount)}%)`;
}

/** True when none of the send's push results were recorded (delivered and failed would read 0). */
export function pushResultsUnknown({ sentCount, push }: Pick<SentNotification, "sentCount" | "push">): boolean {
  return sentCount > 0 && push.unknown >= sentCount;
}

/** The Delivered or Failed cell: the count, or "—" when the send's results weren't recorded. */
export function formatPushCount(
  notification: Pick<SentNotification, "sentCount" | "push">,
  result: "delivered" | "failed",
): string {
  return pushResultsUnknown(notification) ? "—" : formatCount(notification.push[result]);
}

const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * An API date-time (`2026-11-23T16:51:53+02:00`) as the date and time it shows, in the page's
 * language with Latin digits: the wall-clock time the API gave, whatever the browser's zone.
 * Anything else is shown as it came.
 */
export function formatSentAt(value: string, locale: string): string {
  const match = isoDateTime.exec(value);
  if (!match) return value;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    numberingSystem: "latn",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}
