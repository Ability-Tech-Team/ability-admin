import { describe, expect, it } from "vitest";
import {
  NotificationsAnswerError,
  buildSendNotificationForm,
  toSentCount,
  type SendNotificationInput,
} from "./notifications";
import {
  checkNotificationImage,
  emptyNotificationForm,
  validateNotificationForm,
} from "@/src/app/[locale]/(app)/notifications/utils";

const input: SendNotificationInput = {
  projectId: 3,
  target: "customers",
  enTitle: " Pool maintenance ",
  arTitle: "صيانة المسبح",
  enBody: "Closed on Friday.",
  arBody: "مغلق يوم الجمعة.",
  image: null,
};

describe("buildSendNotificationForm", () => {
  it("sends SendNotificationDto's fields as text", () => {
    expect(Object.fromEntries(buildSendNotificationForm(input).entries())).toEqual({
      project_id: "3",
      target: "customers",
      en_title: "Pool maintenance",
      ar_title: "صيانة المسبح",
      en_body: "Closed on Friday.",
      ar_body: "مغلق يوم الجمعة.",
    });
  });

  it("adds the image under the interceptor's field name", () => {
    const image = new File(["x"], "notice.png", { type: "image/png" });
    const form = buildSendNotificationForm({ ...input, image });
    const sent = form.get("image");
    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe("notice.png");
  });
});

describe("toSentCount", () => {
  it("reads the recipients (shaped like sendProjectNotification's answer)", () => {
    expect(toSentCount({ message: "Notification sent successfully", recipients: 128 })).toBe(128);
  });

  it("rejects an answer without them", () => {
    expect(() => toSentCount({ message: "ok" })).toThrow(NotificationsAnswerError);
  });
});

describe("checkNotificationImage", () => {
  it("takes the route's photo types up to 5 MB", () => {
    expect(checkNotificationImage({ name: "a.JPG", size: 1024 })).toBeNull();
    expect(checkNotificationImage({ name: "a.gif", size: 1024 })).toBe("imageType");
    expect(checkNotificationImage({ name: "a.webp", size: 5 * 1024 * 1024 + 1 })).toBe("imageTooLarge");
  });
});

describe("validateNotificationForm", () => {
  it("asks for a project and both languages' title and body", () => {
    const result = validateNotificationForm(emptyNotificationForm());
    expect(result).toEqual({
      ok: false,
      errors: {
        projectId: "required",
        enTitle: "required",
        arTitle: "required",
        enBody: "required",
        arBody: "required",
      },
    });
  });

  it("refuses a title over 255 characters", () => {
    const result = validateNotificationForm({
      ...emptyNotificationForm(),
      projectId: "3",
      enTitle: "x".repeat(256),
      arTitle: "ع",
      enBody: "b",
      arBody: "ب",
    });
    expect(result).toEqual({ ok: false, errors: { enTitle: "tooLong" } });
  });

  it("builds the input from a complete form", () => {
    const result = validateNotificationForm({
      projectId: "3",
      target: "guests",
      enTitle: "t",
      arTitle: "ع",
      enBody: "b",
      arBody: "ب",
      image: null,
    });
    expect(result).toEqual({
      ok: true,
      input: { projectId: 3, target: "guests", enTitle: "t", arTitle: "ع", enBody: "b", arBody: "ب", image: null },
    });
  });
});
