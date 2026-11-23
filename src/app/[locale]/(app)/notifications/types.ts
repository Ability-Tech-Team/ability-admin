import type { NotificationTarget } from "@/src/services/notifications";

/** The send form, as typed. */
export type NotificationFormValues = {
  /** "" until a project is picked. */
  projectId: string;
  target: NotificationTarget;
  enTitle: string;
  arTitle: string;
  enBody: string;
  arBody: string;
  image: File | null;
};

/** Why a field can't be sent; each has a `NotificationsScreen.errors.*` label. */
export type NotificationFormError = "required" | "tooLong" | "imageType" | "imageTooLarge";

export type NotificationFormErrors = Partial<
  Record<"projectId" | "enTitle" | "arTitle" | "enBody" | "arBody" | "image", NotificationFormError>
>;
