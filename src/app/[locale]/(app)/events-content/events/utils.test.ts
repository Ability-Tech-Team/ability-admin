import { describe, expect, it } from "vitest";
import type { CommunityEvent } from "@/src/services/events";
import {
  eventChanges,
  eventToForm,
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

  it("leaves a cleared capacity as it was", () => {
    expect(eventChanges(event, { ...eventToForm(event, "en"), capacity: "" }, false, "en")).toEqual({});
  });
});

describe("validateEventForm", () => {
  it("needs both titles, a date and a time, and a whole capacity of 1 or more", () => {
    expect(validateEventForm({ ...eventToForm(event, "en"), titleEn: " ", date: "", capacity: "0" })).toEqual({
      titleEn: "required",
      date: "required",
      capacity: "capacity",
    });
    expect(validateEventForm(eventToForm(event, "en"))).toEqual({});
  });
});
