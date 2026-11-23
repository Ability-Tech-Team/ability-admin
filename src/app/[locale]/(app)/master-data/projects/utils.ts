import {
  isProjectType,
  type BoundaryPoint,
  type Project,
  type ProjectInput,
  type ProjectType,
} from "@/src/services/projects";
import type { ProjectFormErrors, ProjectFormValues } from "./types";

/** `CreateCompanyProjectDto` limits. */
const LIMITS = {
  enName: 100,
  arName: 100,
  companyCode: 10,
  projectCode: 10,
  location: 255,
  managerName: 255,
  googleMapsLink: 2048,
} as const;

/** The `MasterData.types.*` key for each project type. */
export const PROJECT_TYPE_LABEL_KEYS: Record<ProjectType, string> = {
  RESIDENTIAL: "types.residential",
  COMMERCIAL: "types.commercial",
  MIXED: "types.mixed-use",
};

/**
 * The Status filter's choice as the API's `is_active`: one of the two ticked filters by it,
 * none or both list every project.
 */
export function activeFromStatusFilter(selected: ReadonlySet<string>): boolean | undefined {
  const active = selected.has("active");
  const inactive = selected.has("inactive");
  return active === inactive ? undefined : active;
}

export function emptyProjectForm(): ProjectFormValues {
  return {
    enName: "",
    arName: "",
    companyCode: "",
    projectCode: "",
    type: "",
    location: "",
    googleMapsLink: "",
    managerName: "",
    boundary: ["", "", "", ""],
  };
}

export function formatBoundaryPoint({ lat, lng }: BoundaryPoint): string {
  return `${lat}, ${lng}`;
}

export function projectToForm(project: Project): ProjectFormValues {
  const corners = project.boundary?.length === 4 ? project.boundary.map(formatBoundaryPoint) : [];
  return {
    enName: project.enName,
    arName: project.arName,
    companyCode: project.companyCode,
    projectCode: project.projectCode,
    type: isProjectType(project.type) ? project.type : "",
    location: project.location ?? "",
    googleMapsLink: project.googleMapsLink ?? "",
    managerName: project.managerName ?? "",
    boundary: [corners[0] ?? "", corners[1] ?? "", corners[2] ?? "", corners[3] ?? ""],
  };
}

/** "lat, lng" (a comma or spaces between them) as a point, or null when it can't be one. */
export function parseBoundaryPoint(text: string): BoundaryPoint | null {
  const parts = text.trim().split(/\s*,\s*|\s+/);
  if (parts.length !== 2) return null;
  const [lat, lng] = parts.map((part) => (part === "" ? Number.NaN : Number(part)));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function isHttpUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

type Validated =
  | { ok: true; input: ProjectInput & { projectCode: string } }
  | { ok: false; errors: ProjectFormErrors };

/**
 * Checks the form against the DTO's rules (the API checks them again) and builds what the
 * service sends. `projectCode` is checked only when creating.
 */
export function validateProjectForm(values: ProjectFormValues, mode: "create" | "edit"): Validated {
  const errors: ProjectFormErrors = {};
  const required: ("enName" | "arName" | "companyCode" | "projectCode")[] = ["enName", "arName", "companyCode"];
  if (mode === "create") required.push("projectCode");
  for (const field of required) {
    if (!values[field].trim()) errors[field] = "required";
  }
  for (const [field, max] of Object.entries(LIMITS) as [keyof typeof LIMITS, number][]) {
    if (!errors[field] && values[field].trim().length > max) errors[field] = "tooLong";
  }
  const link = values.googleMapsLink.trim();
  if (link && !errors.googleMapsLink && !isHttpUrl(link)) errors.googleMapsLink = "invalidUrl";

  let boundary: BoundaryPoint[] | null = null;
  const filled = values.boundary.filter((corner) => corner.trim());
  if (filled.length > 0) {
    const points = values.boundary.map((corner) => (corner.trim() ? parseBoundaryPoint(corner) : null));
    const pointErrors = values.boundary.map((corner, index) =>
      !corner.trim() ? ("required" as const) : points[index] ? undefined : ("invalidPoint" as const),
    );
    if (pointErrors.some(Boolean)) {
      errors.points = pointErrors;
      if (filled.length < 4) errors.boundary = "boundaryIncomplete";
    } else {
      boundary = points.filter((point): point is BoundaryPoint => point !== null);
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    input: {
      enName: values.enName,
      arName: values.arName,
      companyCode: values.companyCode,
      projectCode: values.projectCode,
      type: values.type || null,
      location: values.location,
      googleMapsLink: values.googleMapsLink,
      managerName: values.managerName,
      boundary,
    },
  };
}
