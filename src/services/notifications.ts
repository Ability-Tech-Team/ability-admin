import { z } from "zod";
import { apiPost } from "@/src/lib/apiClient";

/**
 * Sending a project notification: `POST /admin/notifications`
 * (ability-crm-api/apps/community-admin/src/notifications, built by
 * `customerSharedService.sendProjectNotification` in libs/domain/src/customers). Open to any
 * signed-in employee for a project they can reach. There is no route that lists what was sent.
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
