/** A choice in the project filter and the form's project select (value: the project id). */
export type ProjectChoice = { value: string; label: string };

/** The guideline form's fields the API saves, as typed. */
export type GuidelineFormValues = {
  titleEn: string;
  titleAr: string;
  /** A project id; "" is "All Projects". */
  project: string;
  /** The one "Guideline Text" box. */
  text: string;
  status: "draft" | "published";
};

/** Why a field can't be saved; each has a `ProjectsScreen.errors.*` label. */
export type GuidelineFormError = "required" | "tooLong";

export type GuidelineFormErrors = Partial<Record<"titleEn" | "titleAr" | "text", GuidelineFormError>>;

export type GuidelineModalState = { mode: "create" } | { mode: "edit"; guidelineId: number } | null;
