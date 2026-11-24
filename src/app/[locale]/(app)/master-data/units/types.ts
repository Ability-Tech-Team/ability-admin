/** The Add Unit form as typed: every field a string (a select's value), read by `validateUnitForm`. */
export type UnitFormValues = {
  projectId: string;
  /** The building (sub-project); empty for none. */
  subProjectId: string;
  unitNumber: string;
  floor: string;
  unitTypeId: string;
  locationId: string;
  totalArea: string;
};

/** The projects Add Unit offers (`addUnitProjectChoice`). */
export type AddUnitProjects = {
  /** Null while loading, or when they couldn't be loaded. */
  options: { id: number; name: string }[] | null;
  /** True when the user can't choose (the project list was refused): the form saves to the sign-in project. */
  locked: boolean;
  /** No project can be offered: the list couldn't be loaded, or there is no sign-in project. */
  unavailable: boolean;
};

/** `required`: missing; `area`: not a number above 0; `floor`: not a whole number. */
export type UnitFormProblem = "required" | "area" | "floor";

export type UnitFormErrors = Partial<Record<keyof UnitFormValues, UnitFormProblem>>;
