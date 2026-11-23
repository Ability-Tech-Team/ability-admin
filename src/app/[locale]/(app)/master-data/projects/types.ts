import type { ProjectType } from "@/src/services/projects";

/** The project form's text, as typed. */
export type ProjectFormValues = {
  enName: string;
  arName: string;
  companyCode: string;
  /** Create only: the API can't change it afterwards. */
  projectCode: string;
  /** "" when not set. */
  type: ProjectType | "";
  location: string;
  googleMapsLink: string;
  managerName: string;
  /** Four corners, each typed as "lat, lng". */
  boundary: [string, string, string, string];
};

export type ProjectFormField = Exclude<keyof ProjectFormValues, "boundary"> | "boundary";

/** Why a field can't be saved; each has a `ProjectsScreen.errors.*` label. */
export type ProjectFormError =
  | "required"
  | "tooLong"
  | "invalidUrl"
  | "invalidPoint"
  | "boundaryIncomplete";

export type ProjectFormErrors = Partial<Record<ProjectFormField, ProjectFormError>> & {
  /** Per corner, when that corner can't be read. */
  points?: (ProjectFormError | undefined)[];
};

export type ProjectModalState =
  | { mode: "create" }
  | { mode: "edit"; projectId: number }
  | null;
