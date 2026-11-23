import { describe, expect, it, vi } from "vitest";
import {
  EventsAnswerError,
  buildCreateEventForm,
  buildUpdateEventForm,
  deleteEvent,
  eventsQuery,
  fetchEvents,
  setEventPublished,
  toEvent,
  toEventsPage,
  type EventInput,
} from "./events";

// Answers shaped like ContentService.formatEvent / getEvents in
// ability-crm-api/apps/community-admin/src/content/content.service.ts.

const event = {
  id: 7,
  project: { id: 3, name: "Marina Heights" },
  en_title: "Community BBQ Night",
  ar_title: "ليلة الشواء المجتمعية",
  en_description: "Food and music",
  ar_description: null,
  event_date: "2026-12-07",
  event_time: "18:00",
  capacity: 100,
  en_location: "Pool Deck",
  ar_location: "منطقة المسبح",
  ticketing_url: "https://tickets.example.com/bbq",
  image: { file_path: "https://bucket.s3.amazonaws.com/e.jpg?X-Amz-Signature=1" },
  is_published: 1,
  published_at: "2026-11-20T10:00:00+02:00",
  created_at: "2026-11-19T09:00:00+02:00",
};

const adapted = {
  id: 7,
  projectId: 3,
  projectName: "Marina Heights",
  enTitle: "Community BBQ Night",
  arTitle: "ليلة الشواء المجتمعية",
  enDescription: "Food and music",
  arDescription: null,
  date: "2026-12-07",
  time: "18:00",
  capacity: 100,
  enLocation: "Pool Deck",
  arLocation: "منطقة المسبح",
  ticketingUrl: "https://tickets.example.com/bbq",
  imageUrl: "https://bucket.s3.amazonaws.com/e.jpg?X-Amz-Signature=1",
  published: true,
  publishedAt: "2026-11-20T10:00:00+02:00",
  createdAt: "2026-11-19T09:00:00+02:00",
};

function envelope(result: unknown) {
  return new Response(JSON.stringify({ result, success: true, statusCode: 200 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("toEvent", () => {
  it("adapts the API's event", () => {
    expect(toEvent(event)).toEqual(adapted);
  });

  it("keeps a draft without capacity, location or image", () => {
    expect(
      toEvent({
        ...event,
        capacity: null,
        en_location: null,
        ar_location: null,
        ticketing_url: null,
        image: { file_path: null },
        is_published: 0,
        published_at: null,
      }),
    ).toMatchObject({ capacity: null, enLocation: null, imageUrl: null, published: false, publishedAt: null });
  });

  it("rejects an answer without the expected shape", () => {
    expect(() => toEvent({ ...event, is_published: 2 })).toThrow(EventsAnswerError);
    expect(() => toEvent({ ...event, project: undefined })).toThrow(EventsAnswerError);
  });
});

describe("toEventsPage", () => {
  it("adapts the list and its paging", () => {
    expect(toEventsPage({ total_count: 21, total_pages: 2, events: [event] })).toEqual({
      totalCount: 21,
      totalPages: 2,
      events: [adapted],
    });
  });

  it("rejects an answer without events", () => {
    expect(() => toEventsPage({ total_count: 0, total_pages: 0 })).toThrow(EventsAnswerError);
  });
});

describe("eventsQuery", () => {
  it("sends only the filters that are set", () => {
    expect(eventsQuery({ search: "  bbq ", page: 2, limit: 20 })).toEqual({
      search: "bbq",
      project_id: undefined,
      is_published: undefined,
      from_date: undefined,
      to_date: undefined,
      page: 2,
      limit: 20,
    });
  });

  it("sends the project, the publishing state and the dates", () => {
    expect(
      eventsQuery({ search: "", projectId: 3, published: false, fromDate: "2026-12-01", toDate: "2026-12-31", page: 1, limit: 20 }),
    ).toMatchObject({ project_id: 3, is_published: 0, from_date: "2026-12-01", to_date: "2026-12-31" });
    expect(eventsQuery({ search: "", published: true, page: 1, limit: 20 }).is_published).toBe(1);
  });
});

describe("fetchEvents", () => {
  it("GETs /content/events with the query and adapts the answer", async () => {
    const fetchImpl = vi.fn(async () => envelope({ total_count: 1, total_pages: 1, events: [event] }));
    vi.stubGlobal("fetch", fetchImpl);
    try {
      const page = await fetchEvents("https://api.test/admin", { search: "", projectId: 3, published: true, page: 1, limit: 20 }, "en");
      expect(page.events).toEqual([adapted]);
      const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("https://api.test/admin/content/events?project_id=3&is_published=1&page=1&limit=20");
      expect(init.method).toBe("GET");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

const input: EventInput = {
  projectId: 3,
  enTitle: " BBQ ",
  arTitle: " شواء ",
  enDescription: " ",
  arDescription: "وصف",
  date: "2026-12-07",
  time: "18:00",
  capacity: null,
  enLocation: "Pool Deck",
  arLocation: "",
  ticketingUrl: " https://tickets.example.com/bbq ",
  published: false,
  image: new File(["x"], "e.png", { type: "image/png" }),
};

describe("buildCreateEventForm", () => {
  it("sends the required fields and the image, and leaves out empty optional ones", () => {
    const form = buildCreateEventForm(input);
    expect([...form.keys()]).toEqual([
      "project_id",
      "en_title",
      "ar_title",
      "ar_description",
      "event_date",
      "event_time",
      "en_location",
      "ticketing_url",
      "is_published",
      "image",
    ]);
    expect(form.get("project_id")).toBe("3");
    expect(form.get("en_title")).toBe("BBQ");
    expect(form.get("ticketing_url")).toBe("https://tickets.example.com/bbq");
    expect(form.get("is_published")).toBe("0");
    expect(form.get("image")).toBeInstanceOf(File);
  });

  it("sends a capacity when there is one", () => {
    expect(buildCreateEventForm({ ...input, capacity: 50 }).get("capacity")).toBe("50");
  });
});

describe("buildUpdateEventForm", () => {
  it("sends only what changed", () => {
    const form = buildUpdateEventForm({ enTitle: " New ", published: true });
    expect([...form.entries()]).toEqual([
      ["en_title", "New"],
      ["is_published", "1"],
    ]);
  });

  it("sends cleared text empty, and leaves a null capacity as it was", () => {
    const form = buildUpdateEventForm({ enDescription: "", arLocation: " ", capacity: null });
    expect([...form.entries()]).toEqual([
      ["en_description", ""],
      ["ar_location", ""],
    ]);
  });

  it("sends the project, date, time, capacity and a new image", () => {
    const image = new File(["x"], "e.webp", { type: "image/webp" });
    const form = buildUpdateEventForm({ projectId: 1, date: "2026-12-08", time: "09:30", capacity: 30, image });
    expect(form.get("project_id")).toBe("1");
    expect(form.get("event_date")).toBe("2026-12-08");
    expect(form.get("event_time")).toBe("09:30");
    expect(form.get("capacity")).toBe("30");
    expect(form.get("image")).toBeInstanceOf(File);
  });
});

describe("setEventPublished and deleteEvent", () => {
  it("PUTs is_published to /content/events/:id and DELETEs it", async () => {
    const fetchImpl = vi.fn(async () => envelope({ message: "Done" }));
    vi.stubGlobal("fetch", fetchImpl);
    try {
      await setEventPublished("https://api.test/admin", 7, true, "ar");
      await deleteEvent("https://api.test/admin", 7, "ar");
      const [putUrl, putInit] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
      expect(putUrl).toBe("https://api.test/admin/content/events/7");
      expect(putInit.method).toBe("PUT");
      expect((putInit.body as FormData).get("is_published")).toBe("1");
      const [deleteUrl, deleteInit] = fetchImpl.mock.calls[1] as unknown as [string, RequestInit];
      expect(deleteUrl).toBe("https://api.test/admin/content/events/7");
      expect(deleteInit.method).toBe("DELETE");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
