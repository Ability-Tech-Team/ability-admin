import {
  ALL_PROJECTS_ID,
  GUIDELINE_CONTENT_MAX,
  GUIDELINE_TITLE_MAX,
  type Guideline,
  type GuidelineInput,
} from "@/src/services/guidelines";
import type { GuidelineFormErrors, GuidelineFormValues, ProjectChoice } from "./types";

/**
 * The value of a multi-choice filter when exactly one is ticked. The API filters by one
 * project at a time, so with none or several ticked the filter isn't sent.
 */
export function singleProjectId(selected: ReadonlySet<string>): number | null {
  if (selected.size !== 1) return null;
  const id = Number([...selected][0]);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** "" in the form's project select is "All Projects". */
export function projectIdFromChoice(value: string): number {
  return value === "" ? ALL_PROJECTS_ID : Number(value);
}

export function emptyGuidelineForm(): GuidelineFormValues {
  return { titleEn: "", titleAr: "", project: "", text: "", status: "draft" };
}

/** The edit form shows the English text in the one text box. */
export function guidelineToForm(guideline: Guideline): GuidelineFormValues {
  return {
    titleEn: guideline.titleEn,
    titleAr: guideline.titleAr,
    project: String(guideline.projectId),
    text: guideline.contentEn,
    status: guideline.published ? "published" : "draft",
  };
}

/**
 * The edit form's project choices: the guideline's own project is always one of them (it may
 * be "All Projects", or a project the list doesn't offer this role).
 */
export function editProjectChoices(
  guideline: Guideline,
  choices: ProjectChoice[],
  allProjectsLabel: string,
): ProjectChoice[] {
  const current = String(guideline.projectId);
  if (choices.some((choice) => choice.value === current)) return choices;
  const label =
    guideline.projectId === ALL_PROJECTS_ID ? allProjectsLabel : (guideline.projectName ?? current);
  return [{ value: current, label }, ...choices];
}

export function validateGuidelineForm(values: GuidelineFormValues): GuidelineFormErrors {
  const errors: GuidelineFormErrors = {};
  const check = (field: "titleEn" | "titleAr" | "text", max: number) => {
    const value = values[field].trim();
    if (!value) errors[field] = "required";
    else if (value.length > max) errors[field] = "tooLong";
  };
  check("titleEn", GUIDELINE_TITLE_MAX);
  check("titleAr", GUIDELINE_TITLE_MAX);
  check("text", GUIDELINE_CONTENT_MAX);
  return errors;
}

/**
 * A new guideline. The API takes an English and an Arabic text and the screen has one box, so
 * its text is saved as both.
 */
export function buildCreateGuidelineInput(values: GuidelineFormValues): GuidelineInput {
  return {
    projectId: projectIdFromChoice(values.project),
    titleEn: values.titleEn,
    titleAr: values.titleAr,
    contentEn: values.text,
    contentAr: values.text,
    published: values.status === "published",
  };
}

/**
 * An edited guideline. The box edits the English text; the Arabic one follows it only while
 * both were the same (as this screen saves them), so an Arabic text written elsewhere is kept.
 */
export function buildUpdateGuidelineInput(
  guideline: Guideline,
  values: GuidelineFormValues,
): Partial<GuidelineInput> {
  return {
    projectId: projectIdFromChoice(values.project),
    titleEn: values.titleEn,
    titleAr: values.titleAr,
    contentEn: values.text,
    ...(guideline.contentAr === guideline.contentEn && { contentAr: values.text }),
    published: values.status === "published",
  };
}
