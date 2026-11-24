import type { ApiFailure } from "@/src/lib/apiFailure";
import type { ProjectOption } from "@/src/services/projects";
import type { NewUnit } from "@/src/services/units";
import type { AddUnitProjects, UnitFormErrors, UnitFormValues } from "./types";

/** Up to two initials for an owner's avatar: the first letters of the first two words. */
export function ownerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
    .join("");
}

const OWNER_COLORS = ["bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-violet-500"] as const;

/** The same colour for a customer every time. */
export function ownerColor(customerId: number): string {
  return OWNER_COLORS[Math.abs(customerId) % OWNER_COLORS.length];
}

/** One of the two ticked statuses filters by it; none or both list every unit. */
export function activeFromStatusFilter(selected: ReadonlySet<string>): boolean | undefined {
  const active = selected.has("active");
  const inactive = selected.has("inactive");
  return active === inactive ? undefined : active;
}

type ProjectsQuery = { data: ProjectOption[] | null; failure: ApiFailure | null };

/**
 * Where Add Unit may save: one of the employee's active projects (`fetchProjectOptions`),
 * starting on the list's project filter. If the project list is refused (403, an API without
 * `/projects/accessible`), the unit saves to the sign-in project, shown but not changeable.
 */
export function addUnitProjectChoice(
  projects: ProjectsQuery,
  sessionProject: { id: number; name: string | null } | null,
  filterProjectId: number | undefined,
): { projects: AddUnitProjects; initialProjectId: string } {
  if (projects.failure?.reason === "forbidden") {
    return sessionProject
      ? {
          projects: {
            options: [{ id: sessionProject.id, name: sessionProject.name ?? `#${sessionProject.id}` }],
            locked: true,
            unavailable: false,
          },
          initialProjectId: String(sessionProject.id),
        }
      : { projects: { options: null, locked: true, unavailable: true }, initialProjectId: "" };
  }
  if (projects.failure) {
    return { projects: { options: null, locked: false, unavailable: true }, initialProjectId: "" };
  }
  if (!projects.data) {
    return { projects: { options: null, locked: false, unavailable: false }, initialProjectId: "" };
  }
  const options = projects.data.filter((project) => project.active).map(({ id, name }) => ({ id, name }));
  const initial = options.some((project) => project.id === filterProjectId) ? String(filterProjectId) : "";
  return { projects: { options, locked: false, unavailable: false }, initialProjectId: initial };
}

/** An empty Add Unit form, on `projectId` when one is already decided (e.g. the sign-in project). */
export function emptyUnitForm(projectId = ""): UnitFormValues {
  return { projectId, subProjectId: "", unitNumber: "", floor: "", unitTypeId: "", locationId: "", totalArea: "" };
}

const ID = /^\d+$/;
const WHOLE = /^-?\d+$/;

type Validated = { ok: true; input: NewUnit } | { ok: false; errors: UnitFormErrors };

/**
 * `CreateUnitDto`'s rules for the form's fields: a project (the admin API requires one), unit
 * number, unit type, location and a total area above 0; the floor, when given, is a whole
 * number. The API checks the rest (a unit number used twice, a building outside the project).
 */
export function validateUnitForm(values: UnitFormValues): Validated {
  const errors: UnitFormErrors = {};
  const id = (value: string) => (ID.test(value) && Number(value) > 0 ? Number(value) : null);

  const projectId = id(values.projectId);
  const unitTypeId = id(values.unitTypeId);
  const locationId = id(values.locationId);
  const unitNumber = values.unitNumber.trim();
  if (projectId === null) errors.projectId = "required";
  if (!unitNumber) errors.unitNumber = "required";
  if (unitTypeId === null) errors.unitTypeId = "required";
  if (locationId === null) errors.locationId = "required";

  const area = values.totalArea.trim();
  const totalArea = Number(area);
  if (!area) errors.totalArea = "required";
  else if (!Number.isFinite(totalArea) || totalArea <= 0) errors.totalArea = "area";

  const floor = values.floor.trim();
  if (floor && !WHOLE.test(floor)) errors.floor = "floor";

  if (Object.keys(errors).length > 0 || projectId === null || unitTypeId === null || locationId === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    input: {
      projectId,
      subProjectId: id(values.subProjectId),
      unitNumber,
      unitTypeId,
      locationId,
      totalArea,
      floor: floor ? Number(floor) : null,
    },
  };
}
