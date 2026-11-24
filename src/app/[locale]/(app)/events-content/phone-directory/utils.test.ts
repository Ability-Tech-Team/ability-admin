import { describe, expect, it } from "vitest";
import type { PhoneContact } from "@/src/services/phoneDirectory";
import {
  buildContactChanges,
  buildContactInput,
  contactProjectChoices,
  contactToForm,
  emptyContactForm,
  validateContactForm,
} from "./utils";

const contact: PhoneContact = {
  id: 5,
  projectId: 2,
  projectName: "Marina",
  nameEn: "Security Desk",
  nameAr: "مكتب الأمن",
  phone: "+97143456789",
  sortOrder: 0,
  published: true,
  publishedAt: "2026-11-20T09:15:00+02:00",
  createdAt: "2026-11-19T18:00:00+02:00",
};

describe("validateContactForm", () => {
  it("accepts a complete contact, with spaces or dashes in the number, and a short hotline", () => {
    expect(validateContactForm(contactToForm(contact))).toEqual({});
    expect(validateContactForm({ ...contactToForm(contact), phone: "+971 4 345-6789" })).toEqual({});
    expect(validateContactForm({ ...contactToForm(contact), phone: "999" })).toEqual({});
  });

  it("names every required field of an empty form", () => {
    expect(validateContactForm(emptyContactForm())).toEqual({
      nameEn: "required",
      nameAr: "required",
      phone: "required",
      project: "required",
    });
  });

  it("refuses names longer than the API takes, and a number the app couldn't dial", () => {
    expect(validateContactForm({ ...contactToForm(contact), nameEn: "x".repeat(101), phone: "12" })).toEqual({
      nameEn: "tooLong",
      phone: "phone",
    });
    expect(validateContactForm({ ...contactToForm(contact), phone: "call me" })).toEqual({ phone: "phone" });
  });
});

describe("buildContactInput", () => {
  it("turns the form into what the API saves", () => {
    expect(buildContactInput({ ...contactToForm(contact), status: "draft" })).toEqual({
      projectId: 2,
      nameEn: "Security Desk",
      nameAr: "مكتب الأمن",
      phone: "+97143456789",
      published: false,
    });
  });
});

describe("buildContactChanges", () => {
  it("is null when nothing changed, the number's spacing aside", () => {
    expect(buildContactChanges(contact, contactToForm(contact))).toBeNull();
    expect(buildContactChanges(contact, { ...contactToForm(contact), phone: "+971 4 345-6789" })).toBeNull();
  });

  it("holds only what changed", () => {
    expect(buildContactChanges(contact, { ...contactToForm(contact), phone: "999", status: "draft" })).toEqual({
      phone: "999",
      published: false,
    });
    expect(buildContactChanges(contact, { ...contactToForm(contact), project: "1" })).toEqual({ projectId: 1 });
  });
});

describe("contactProjectChoices", () => {
  const own = [{ value: "2", label: "Marina" }];

  it("offers All Projects and the employee's projects, and keeps the contact's own", () => {
    expect(contactProjectChoices(own, "All Projects", null)).toEqual([{ value: "1", label: "All Projects" }, ...own]);
    expect(contactProjectChoices(own, "All Projects", contact)).toHaveLength(2);
    expect(contactProjectChoices(own, "All Projects", { ...contact, projectId: 9, projectName: null }).at(-1)).toEqual({
      value: "9",
      label: "#9",
    });
  });
});
