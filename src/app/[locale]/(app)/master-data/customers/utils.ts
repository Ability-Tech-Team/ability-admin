import type { CreateCustomerBody, UpdateCustomerBody } from "@/src/services/customers";
import type { Customer, CustomerFormField, CustomerFormValues, CustomerUnit } from "./types";

/** Up to two letters from the first two words of the name. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

const avatarColors = [
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-400",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
];

/** The same customer always gets the same color. */
export function avatarColorOf(customerId: number): string {
  return avatarColors[Math.abs(customerId) % avatarColors.length];
}

/**
 * The value of a multi-choice filter when exactly one is ticked. The API filters by one value
 * at a time, so with none or several ticked the filter isn't sent.
 */
export function singleChoice(selected: ReadonlySet<string>): string | null {
  return selected.size === 1 ? [...selected][0] : null;
}

/** The unit shown on the customer's row: an active one first. */
export function primaryUnit(customer: Customer): CustomerUnit | null {
  return customer.units.find((unit) => unit.active) ?? customer.units[0] ?? null;
}

/** What the customer is on their units (owner, renter...), each once, active links first. */
export function ownershipNames(customer: Customer): string[] {
  const ordered = [...customer.units].sort((a, b) => Number(b.active) - Number(a.active));
  return [...new Set(ordered.map((unit) => unit.ownershipName).filter((name): name is string => Boolean(name)))];
}

export function emptyCustomerForm(projectId = ""): CustomerFormValues {
  return {
    name: "",
    mobile: "",
    email: "",
    idTypeId: "",
    idNumber: "",
    countryId: "",
    customerTypeId: "",
    maritalStatusId: "",
    religionId: "",
    projectId,
  };
}

export function customerFormFrom(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    mobile: customer.mobile ?? "",
    email: customer.email ?? "",
    idTypeId: String(customer.idTypeId),
    idNumber: customer.idNumber,
    countryId: customer.countryId === null ? "" : String(customer.countryId),
    customerTypeId: customer.customerTypeId === null ? "" : String(customer.customerTypeId),
    maritalStatusId: customer.maritalStatusId === null ? "" : String(customer.maritalStatusId),
    religionId: customer.religionId === null ? "" : String(customer.religionId),
    projectId: "",
  };
}

/** What `CreateCustomerDto` requires, plus the mobile the form asks for. */
export const CREATE_REQUIRED: readonly CustomerFormField[] = [
  "name",
  "mobile",
  "idTypeId",
  "idNumber",
  "countryId",
  "customerTypeId",
  "maritalStatusId",
  "religionId",
  "projectId",
];

/** The edit form's starred fields. */
export const EDIT_REQUIRED: readonly CustomerFormField[] = ["name", "mobile", "idNumber"];

export function missingFields(values: CustomerFormValues, required: readonly CustomerFormField[]): CustomerFormField[] {
  return required.filter((field) => !values[field].trim());
}

/** The create body; call it once `missingFields(values, CREATE_REQUIRED)` is empty. */
export function buildCreateCustomerBody(values: CustomerFormValues): CreateCustomerBody {
  const mobile = values.mobile.trim();
  const email = values.email.trim();
  return {
    project_id: Number(values.projectId),
    customer_name: values.name.trim(),
    country_id: Number(values.countryId),
    id_type: Number(values.idTypeId),
    id_number: values.idNumber.trim(),
    marital_status_id: Number(values.maritalStatusId),
    religion_id: Number(values.religionId),
    customer_type_id: Number(values.customerTypeId),
    ...(mobile && { mobile_number: mobile }),
    ...(email && { email }),
  };
}

/**
 * Only what changed, so the customer's log records the real edits. A cleared mobile or email
 * isn't sent: the API refuses an empty value and has no way to remove one.
 */
export function buildUpdateCustomerBody(customer: Customer, values: CustomerFormValues): UpdateCustomerBody {
  const body: UpdateCustomerBody = {};
  const name = values.name.trim();
  const mobile = values.mobile.trim();
  const email = values.email.trim();
  const idNumber = values.idNumber.trim();
  if (name && name !== customer.name) body.customer_name = name;
  if (mobile && mobile !== (customer.mobile ?? "")) body.mobile_number = mobile;
  if (email && email !== (customer.email ?? "")) body.email = email;
  if (idNumber && idNumber !== customer.idNumber) body.id_number = idNumber;

  const lookups: [keyof UpdateCustomerBody, string, number | null][] = [
    ["id_type", values.idTypeId, customer.idTypeId],
    ["country_id", values.countryId, customer.countryId],
    ["customer_type_id", values.customerTypeId, customer.customerTypeId],
    ["marital_status_id", values.maritalStatusId, customer.maritalStatusId],
    ["religion_id", values.religionId, customer.religionId],
  ];
  for (const [field, value, current] of lookups) {
    if (value && Number(value) !== current) Object.assign(body, { [field]: Number(value) });
  }
  return body;
}
