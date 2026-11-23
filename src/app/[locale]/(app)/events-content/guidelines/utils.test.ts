import { describe, expect, it } from "vitest";
import type { Guideline } from "@/src/services/guidelines";
import {
  buildCreateGuidelineInput,
  buildUpdateGuidelineInput,
  editProjectChoices,
  guidelineToForm,
  projectIdFromChoice,
  singleProjectId,
  validateGuidelineForm,
} from "./utils";

const guideline: Guideline = {
  id: 7,
  projectId: 1,
  projectName: "All Projects",
  titleEn: "Pool Rules",
  titleAr: "قواعد المسبح",
  contentEn: "No glass.",
  contentAr: "No glass.",
  sortOrder: 0,
  published: true,
  publishedAt: null,
  createdAt: null,
};

describe("project choices", () => {
  it("filters by a project only when exactly one is ticked", () => {
    expect(singleProjectId(new Set(["3"]))).toBe(3);
    expect(singleProjectId(new Set(["3", "4"]))).toBeNull();
    expect(singleProjectId(new Set())).toBeNull();
  });

  it("reads the form's empty choice as All Projects", () => {
    expect(projectIdFromChoice("")).toBe(1);
    expect(projectIdFromChoice("3")).toBe(3);
  });

  it("keeps the guideline's own project among the edit choices", () => {
    const choices = [{ value: "3", label: "Marina" }];
    expect(editProjectChoices(guideline, choices, "All Projects")).toEqual([
      { value: "1", label: "All Projects" },
      ...choices,
    ]);
    expect(editProjectChoices({ ...guideline, projectId: 3 }, choices, "All Projects")).toBe(choices);
  });
});

describe("validateGuidelineForm", () => {
  it("needs both titles and the text, within the DTO's limits", () => {
    expect(
      validateGuidelineForm({ titleEn: " ", titleAr: "ب", project: "", text: "x".repeat(20001), status: "draft" }),
    ).toEqual({ titleEn: "required", text: "tooLong" });
  });
});

describe("guideline inputs", () => {
  it("saves the one text box as both texts on create", () => {
    expect(
      buildCreateGuidelineInput({ titleEn: "A", titleAr: "ب", project: "", text: "Rules", status: "published" }),
    ).toEqual({ projectId: 1, titleEn: "A", titleAr: "ب", contentEn: "Rules", contentAr: "Rules", published: true });
  });

  it("keeps the Arabic text in step only while both texts were the same", () => {
    const values = { ...guidelineToForm(guideline), text: "New rules", status: "draft" as const };
    expect(buildUpdateGuidelineInput(guideline, values)).toMatchObject({
      contentEn: "New rules",
      contentAr: "New rules",
      published: false,
      projectId: 1,
    });
    const separate = { ...guideline, contentAr: "ممنوع الزجاج." };
    expect(buildUpdateGuidelineInput(separate, values)).not.toHaveProperty("contentAr");
  });
});
