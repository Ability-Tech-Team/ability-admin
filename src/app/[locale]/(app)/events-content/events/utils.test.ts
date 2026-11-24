import { describe, expect, it } from "vitest";
import type { CommunityEvent } from "@/src/services/events";
import {
  buildEventInput,
  checkEventImage,
  emptyEventForm,
  eventChanges,
  eventToForm,
  isTicketingUrl,
  locationIn,
  projectIdFromFilter,
  publishedFromStatusFilter,
  validateEventForm,
} from "./utils";

const event: CommunityEvent = {
  id: 7,
  projectId: 3,
  projectName: "Marina Heights",
  enTitle: "BBQ",
  arTitle: "شواء",
  enDescription: "Food",
  arDescription: "طعام",
  date: "2026-12-07",
  time: "18:00",
  capacity: 100,
  enLocation: "Pool Deck",
  arLocation: null,
  ticketingUrl: "https://tickets.example.com",
  imageUrl: null,
  published: false,
  publishedAt: null,
  createdAt: null,
};

describe("filters", () => {
  it("sends one status or project only when exactly one is ticked", () => {
    expect(publishedFromStatusFilter(new Set(["published"]))).toBe(true);
    expect(publishedFromStatusFilter(new Set(["draft"]))).toBe(false);
    expect(publishedFromStatusFilter(new Set(["draft", "published"]))).toBeUndefined();
    expect(projectIdFromFilter(new Set(["3"]))).toBe(3);
    expect(projectIdFromFilter(new Set(["3", "4"]))).toBeUndefined();
    expect(projectIdFromFilter(new Set())).toBeUndefined();
  });
});

describe("locationIn", () => {
  it("uses the page's language, else the other one", () => {
    expect(locationIn(event, "en")).toBe("Pool Deck");
    expect(locationIn(event, "ar")).toBe("Pool Deck");
    expect(locationIn({ ...event, enLocation: null }, "en")).toBeNull();
  });
});

describe("eventChanges", () => {
  it("sends nothing when nothing changed", () => {
    expect(eventChanges(event, eventToForm(event, "en"), false, "en")).toEqual({});
  });

  it("writes the description and location in the page's language only", () => {
    const values = { ...eventToForm(event, "ar"), description: "جديد", location: "المسبح" };
    expect(eventChanges(event, values, false, "ar")).toEqual({ arDescription: "جديد", arLocation: "المسبح" });
  });

  it("sends the project (All Projects is 1), the publishing state and a new capacity", () => {
    const values = { ...eventToForm(event, "en"), project: "", capacity: "20" };
    expect(eventChanges(event, values, true, "en")).toEqual({ projectId: 1, capacity: 20, published: true });
  });

  it("writes both languages while they were the same, as a new event saves them", () => {
    const same = { ...event, arDescription: "Food", arLocation: "Pool Deck" };
    const values = { ...eventToForm(same, "en"), description: "Drinks", location: "Roof" };
    const both = { enDescription: "Drinks", arDescription: "Drinks", enLocation: "Roof", arLocation: "Roof" };
    expect(eventChanges(same, values, false, "en")).toEqual(both);
    const none = { ...event, enDescription: null, arDescription: null, enLocation: null, arLocation: null };
    expect(eventChanges(none, values, false, "ar")).toEqual(both);
  });

  it("sends a new ticketing link and a newly picked image", () => {
    const image = new File(["x"], "bbq.png");
    const values = { ...eventToForm(event, "en"), ticketingUrl: "https://tickets.example.com/bbq", image };
    expect(eventChanges(event, values, false, "en")).toEqual({ ticketingUrl: "https://tickets.example.com/bbq", image });
  });

  it("leaves a cleared capacity as it was", () => {
    expect(eventChanges(event, { ...eventToForm(event, "en"), capacity: "" }, false, "en")).toEqual({});
  });
});

describe("validateEventForm", () => {
  it("needs both titles, a date and a time, and a whole capacity of 1 or more", () => {
    expect(validateEventForm({ ...eventToForm(event, "en"), titleEn: " ", date: "", capacity: "0" }, event)).toEqual({
      titleEn: "required",
      date: "required",
      capacity: "capacity",
    });
    expect(validateEventForm(eventToForm(event, "en"), event)).toEqual({});
  });

  it("needs a ticketing link and an image on a new event", () => {
    expect(validateEventForm(emptyEventForm(), null)).toEqual({
      titleEn: "required",
      titleAr: "required",
      date: "required",
      time: "required",
      ticketingUrl: "required",
      image: "required",
    });
    expect(validateEventForm({ ...eventToForm(event, "en"), image: new File(["x"], "a.webp") }, null)).toEqual({});
  });

  it("refuses clearing a saved link, but lets an older event without one stay so", () => {
    const cleared = { ...eventToForm(event, "en"), ticketingUrl: " " };
    expect(validateEventForm(cleared, event)).toEqual({ ticketingUrl: "required" });
    expect(validateEventForm(cleared, { ...event, ticketingUrl: null })).toEqual({});
  });

  it("refuses a bad link or image, on an edit too", () => {
    const values = { ...eventToForm(event, "en"), ticketingUrl: "tickets.example.com", image: new File(["x"], "a.pdf") };
    expect(validateEventForm(values, event)).toEqual({ ticketingUrl: "invalidUrl", image: "imageType" });
    const long = `https://a.com/${"x".repeat(2048)}`;
    expect(validateEventForm({ ...eventToForm(event, "en"), ticketingUrl: long }, event)).toEqual({ ticketingUrl: "tooLong" });
  });
});

describe("isTicketingUrl", () => {
  it("takes full http(s) links to a real domain only", () => {
    expect(isTicketingUrl("https://tickets.example.com/a?b=1")).toBe(true);
    expect(isTicketingUrl("http://example.com")).toBe(true);
    for (const bad of ["example.com", "ftp://example.com", "https://localhost", "https://", "javascript:alert(1)"]) {
      expect(isTicketingUrl(bad)).toBe(false);
    }
  });
});

describe("checkEventImage", () => {
  it("takes the API's image types up to 5 MB", () => {
    expect(checkEventImage({ name: "a.JPG", size: 5 * 1024 * 1024 })).toBeNull();
    expect(checkEventImage({ name: "a.png", size: 5 * 1024 * 1024 + 1 })).toBe("imageTooLarge");
    expect(checkEventImage({ name: "a.gif", size: 1 })).toBe("imageType");
  });
});

describe("buildEventInput", () => {
  const image = new File(["x"], "bbq.png");

  it("saves the one description and location in both languages", () => {
    const values = { ...eventToForm(event, "en"), project: "", capacity: "", image };
    expect(buildEventInput(values, true)).toEqual({
      projectId: 1,
      enTitle: "BBQ",
      arTitle: "شواء",
      enDescription: "Food",
      arDescription: "Food",
      date: "2026-12-07",
      time: "18:00",
      capacity: null,
      enLocation: "Pool Deck",
      arLocation: "Pool Deck",
      ticketingUrl: "https://tickets.example.com",
      published: true,
      image,
    });
  });

  it("is null without an image", () => {
    expect(buildEventInput(eventToForm(event, "en"), false)).toBeNull();
  });
});
