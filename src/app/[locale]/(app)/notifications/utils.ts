import {
  NOTIFICATION_BODY_MAX,
  NOTIFICATION_IMAGE_EXTENSIONS,
  NOTIFICATION_IMAGE_MAX_MB,
  NOTIFICATION_TITLE_MAX,
  type SendNotificationInput,
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
