import { RELATIVE_ID_TYPE, type NewRelative } from "@/src/services/familyMembers";
import type { Unit } from "@/src/services/units";

/** The Add Family Member form as typed. */
export type RelativeFormValues = {
  name: string;
  idType: "nationalId" | "passport";
  idNumber: string;
  mobile: string;
  email: string;
  /** The chosen unit (from the "Assign to Unit" search), with its current owners. */
  unit: Unit | null;
  /** The owner the relative is added under; picked automatically when the unit has one. */
  ownerId: number | null;
  relation: string;
};

export type RelativeFormProblem = "required" | "email";
export type RelativeFormErrors = Partial<Record<"name" | "idNumber" | "mobile" | "email" | "unit" | "ownerId", RelativeFormProblem>>;

export function emptyRelativeForm(): RelativeFormValues {
  return { name: "", idType: "nationalId", idNumber: "", mobile: "", email: "", unit: null, ownerId: null, relation: "" };
}

/** The owner to preselect for a unit: its only owner, else none (the form asks). */
export function defaultOwnerId(unit: Unit | null): number | null {
  return unit?.owners.length === 1 ? unit.owners[0].customerId : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Validated = { ok: true; input: NewRelative } | { ok: false; errors: RelativeFormErrors };

/**
 * The form's required fields (as the design marks them), and an owner of the chosen unit. The
 * API checks the ID number and mobile itself (the relatives sheet's rules) and says why it refuses.
 */
export function validateRelativeForm(values: RelativeFormValues): Validated {
  const errors: RelativeFormErrors = {};
  if (!values.name.trim()) errors.name = "required";
  if (!values.idNumber.trim()) errors.idNumber = "required";
  if (!values.mobile.trim()) errors.mobile = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!EMAIL.test(values.email.trim())) errors.email = "email";
  if (!values.unit) errors.unit = "required";
  else if (values.ownerId === null || !values.unit.owners.some((owner) => owner.customerId === values.ownerId)) {
    errors.ownerId = "required";
  }
  if (Object.keys(errors).length > 0 || !values.unit || values.ownerId === null) return { ok: false, errors };
  return {
    ok: true,
    input: {
      projectId: values.unit.projectId,
      unitId: values.unit.id,
      ownerId: values.ownerId,
      name: values.name,
      idType: values.idType === "passport" ? RELATIVE_ID_TYPE.passport : RELATIVE_ID_TYPE.nationalId,
      idNumber: values.idNumber,
      mobile: values.mobile,
      email: values.email,
      relation: values.relation,
    },
  };
}
