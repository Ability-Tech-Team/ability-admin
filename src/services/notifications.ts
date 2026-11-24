import { z } from "zod";
import { apiGet, apiPost, type ApiQuery } from "@/src/lib/apiClient";

/**
 * Project notifications (ability-crm-api/apps/community-admin/src/notifications), open to any
 * signed-in employee for the projects they can reach:
 * - `POST /admin/notifications` sends one (`customerSharedService.sendProjectNotification` in
 *   libs/domain/src/customers);
 * - `GET /admin/notifications` lists what was sent (`SentNotificationsService`), one entry per
 *   send, newest first, with its recipients, reads and push results.
 *
 * Every notification is saved as an announcement for each recipient and pushed to their
 * devices. Calls throw `ApiError` when the API refuses or can't be reached, and
 * `NotificationsAnswerError` when the answer doesn't have the expected shape.
 */

export class NotificationsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "NotificationsAnswerError";
  }
}

/** `notificationAudienceEnums`: the project's residents, its guests, or both. */
export const NOTIFICATION_TARGETS = ["customers", "guests", "all"] as const;
export type NotificationTarget = (typeof NOTIFICATION_TARGETS)[number];

/** `NOTIFICATION_IMAGE` (libs/domain/src/customers/notification-image.ts). */
export const NOTIFICATION_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
export const NOTIFICATION_IMAGE_MAX_MB = 5;
/** `SendNotificationDto` limits. */
export const NOTIFICATION_TITLE_MAX = 255;
export const NOTIFICATION_BODY_MAX = 1000;

export type SendNotificationInput = {
  projectId: number;
  target: NotificationTarget;
  enTitle: string;
  arTitle: string;
  enBody: string;
  arBody: string;
  /** Optional, one photo: jpg, jpeg, png or webp up to 5 MB. */
  image: File | null;
};

/**
 * The request is form-data (the route takes the image under `image`), so every field is text;
 * the DTO turns `project_id` back into a number. The optional `data` object has no field here.
 */
export function buildSendNotificationForm(input: SendNotificationInput): FormData {
  const form = new FormData();
  form.append("project_id", String(input.projectId));
  form.append("target", input.target);
  form.append("en_title", input.enTitle.trim());
  form.append("ar_title", input.arTitle.trim());
  form.append("en_body", input.enBody.trim());
  form.append("ar_body", input.arBody.trim());
  if (input.image) form.append("image", input.image, input.image.name);
  return form;
}

const sentSchema = z.object({ recipients: z.number().int().nonnegative() });

/** How many customers and guests it was sent to. */
export function toSentCount(result: unknown): number {
  const parsed = sentSchema.safeParse(result);
  if (!parsed.success) throw new NotificationsAnswerError("notifications");
  return parsed.data.recipients;
}

/** Resolves with the number of recipients. */
export async function sendNotification(
  apiBaseUrl: string,
  input: SendNotificationInput,
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/notifications", buildSendNotificationForm(input), {
    locale,
  });
  return toSentCount(result);
}

// GET /notifications

/** Each recipient's push result (libs/core/src/notification/push-status.ts), counted per send. */
export type SentNotificationPush = {
  /** Firebase accepted at least one of their devices. */
  delivered: number;
  /** They have devices and none was accepted. */
  failed: number;
  /** No phone registered: not a failure. */
  noDevice: number;
  /** Not recorded: sent before results were kept, push off, or still sending. */
  unknown: number;
};

export type SentNotification = {
  /** The send's first row; unique per send. */
  id: number;
  projectId: number;
  /** In the request's language; null when the project is gone. */
  projectName: string | null;
  enTitle: string;
  arTitle: string;
  enBody: string;
  arBody: string;
  /** Who it reached ("all" when both residents and guests did). */
  audience: NotificationTarget;
  /** Recipients. */
  sentCount: number;
  readCount: number;
  push: SentNotificationPush;
  /** The employee who sent it, when known. */
  sentByName: string | null;
  /** ISO 8601 with the offset, e.g. `2026-11-23T16:51:53+02:00`. */
  createdAt: string;
};

export type SentNotificationsPage = {
  notifications: SentNotification[];
  totalCount: number;
  totalPages: number;
};

export type SentNotificationFilters = {
  /** Part of the English or Arabic title. */
  search: string;
  /** One project; null for every project the employee can reach. */
  projectId: number | null;
};

/** `GetSentNotificationsDto.search`'s limit. */
export const SENT_NOTIFICATIONS_SEARCH_MAX = 100;
export const SENT_NOTIFICATIONS_PAGE_SIZE = 10;

export function sentNotificationsQuery({ search, projectId }: SentNotificationFilters): ApiQuery {
  return {
    search: search.trim().slice(0, SENT_NOTIFICATIONS_SEARCH_MAX) || undefined,
    project_id: projectId ?? undefined,
  };
}

const count = z.number().int().nonnegative();
const optionalText = z.string().nullish().transform((value) => value ?? null);

const sentNotificationSchema = z.object({
  id: z.number().int(),
  project: z.object({ id: z.number().int(), name: optionalText }),
  en_title: z.string(),
  ar_title: z.string(),
  en_body: z.string(),
  ar_body: z.string(),
  audience: z.enum(NOTIFICATION_TARGETS),
  sent_count: count,
  read_count: count,
  push: z.object({
    delivered: count,
    failed: count,
    no_device: count,
    unknown: count,
  }),
  sent_by: z.object({ name: optionalText }).nullish(),
  created_at: z.string(),
});

const sentNotificationsSchema = z.object({
  total_count: count,
  total_pages: count,
  notifications: z.array(sentNotificationSchema),
});

export function toSentNotificationsPage(result: unknown): SentNotificationsPage {
  const parsed = sentNotificationsSchema.safeParse(result);
  if (!parsed.success) throw new NotificationsAnswerError("notifications list");
  const data = parsed.data;
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    notifications: data.notifications.map((entry) => ({
      id: entry.id,
      projectId: entry.project.id,
      projectName: entry.project.name,
      enTitle: entry.en_title,
      arTitle: entry.ar_title,
      enBody: entry.en_body,
      arBody: entry.ar_body,
      audience: entry.audience,
      sentCount: entry.sent_count,
      readCount: entry.read_count,
      push: {
        delivered: entry.push.delivered,
        failed: entry.push.failed,
        noDevice: entry.push.no_device,
        unknown: entry.push.unknown,
      },
      sentByName: entry.sent_by?.name ?? null,
      createdAt: entry.created_at,
    })),
  };
}

/** One page of what was sent, newest first. */
export async function fetchSentNotifications(
  apiBaseUrl: string,
  filters: SentNotificationFilters,
  page: number,
  locale: string,
): Promise<SentNotificationsPage> {
  const result = await apiGet(
    apiBaseUrl,
    "/notifications",
    { ...sentNotificationsQuery(filters), page, limit: SENT_NOTIFICATIONS_PAGE_SIZE },
    { locale },
  );
  return toSentNotificationsPage(result);
}

/** How many sends there are in every project the employee can reach (one entry asked for). */
export async function fetchSentNotificationsCount(apiBaseUrl: string, locale: string): Promise<number> {
  const result = await apiGet(apiBaseUrl, "/notifications", { page: 1, limit: 1 }, { locale });
  return toSentNotificationsPage(result).totalCount;
}
