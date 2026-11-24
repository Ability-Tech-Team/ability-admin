import { describe, expect, it, vi } from "vitest";
import {
  NotificationsAnswerError,
  buildSendNotificationForm,
  fetchSentNotifications,
  fetchSentNotificationsCount,
  sentNotificationsQuery,
  toSentCount,
  toSentNotificationsPage,
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

/** Shaped like `SentNotificationsService.getSentNotifications`' answer. */
const sentEntry = {
  id: 512,
  project: { id: 3, name: "Marina Heights" },
  en_title: "Pool maintenance",
  ar_title: "صيانة المسبح",
  en_body: "Closed on Friday.",
  ar_body: "مغلق يوم الجمعة.",
  audience: "all",
  sent_count: 6,
  read_count: 2,
  push: { delivered: 3, failed: 1, no_device: 2, unknown: 0 },
  sent_by: { id: "9b2c", name: "Mona Adel" },
  created_at: "2026-11-23T16:51:53+02:00",
};

describe("toSentNotificationsPage", () => {
  it("adapts each send", () => {
    expect(toSentNotificationsPage({ total_count: 11, total_pages: 2, notifications: [sentEntry] })).toEqual({
      totalCount: 11,
      totalPages: 2,
      notifications: [
        {
          id: 512,
          projectId: 3,
          projectName: "Marina Heights",
          enTitle: "Pool maintenance",
          arTitle: "صيانة المسبح",
          enBody: "Closed on Friday.",
          arBody: "مغلق يوم الجمعة.",
          audience: "all",
          sentCount: 6,
          readCount: 2,
          push: { delivered: 3, failed: 1, noDevice: 2, unknown: 0 },
          sentByName: "Mona Adel",
          createdAt: "2026-11-23T16:51:53+02:00",
        },
      ],
    });
  });

  it("takes a removed project and an unknown sender", () => {
    const page = toSentNotificationsPage({
      total_count: 1,
      total_pages: 1,
      notifications: [{ ...sentEntry, project: { id: 3, name: null }, sent_by: null }],
    });
    expect(page.notifications[0]).toMatchObject({ projectName: null, sentByName: null });
  });

  it("rejects an unknown audience or a missing push summary", () => {
    const bad = (entry: object) => () =>
      toSentNotificationsPage({ total_count: 1, total_pages: 1, notifications: [entry] });
    expect(bad({ ...sentEntry, audience: "everyone" })).toThrow(NotificationsAnswerError);
    expect(bad({ ...sentEntry, push: undefined })).toThrow(NotificationsAnswerError);
  });
});

describe("sentNotificationsQuery", () => {
  it("sends the trimmed search and the project, and leaves out what's empty", () => {
    expect(sentNotificationsQuery({ search: "  pool ", projectId: 3 })).toEqual({ search: "pool", project_id: 3 });
    expect(sentNotificationsQuery({ search: "   ", projectId: null })).toEqual({
      search: undefined,
      project_id: undefined,
    });
  });

  it("keeps the search within the DTO's 100 characters", () => {
    expect(sentNotificationsQuery({ search: "x".repeat(150), projectId: null }).search).toHaveLength(100);
  });
});

function stubAnswer(result: unknown) {
  const fetchImpl = vi.fn(
    async () => new Response(JSON.stringify({ result, success: true, statusCode: 200 }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchImpl);
  return fetchImpl;
}

describe("fetchSentNotifications", () => {
  it("asks for one page with the DTO's parameter names", async () => {
    const fetchImpl = stubAnswer({ total_count: 0, total_pages: 0, notifications: [] });
    try {
      await fetchSentNotifications("https://api.test/admin", { search: "pool", projectId: 3 }, 2, "ar");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/notifications?search=pool&project_id=3&page=2&limit=10",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("fetchSentNotificationsCount", () => {
  it("asks for one entry and reads the total", async () => {
    const fetchImpl = stubAnswer({ total_count: 42, total_pages: 42, notifications: [sentEntry] });
    let count: number;
    try {
      count = await fetchSentNotificationsCount("https://api.test/admin", "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(count).toBe(42);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/notifications?page=1&limit=1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
