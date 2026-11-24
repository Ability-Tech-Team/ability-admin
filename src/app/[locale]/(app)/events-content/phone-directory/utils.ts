import {
  ALL_PROJECTS_ID,
  PHONE_CONTACT_NAME_MAX,
  isValidPhoneNumber,
  normalizePhoneNumber,
  type PhoneContact,
  type PhoneContactInput,
} from "@/src/services/phoneDirectory";
import type { PhoneContactFormErrors, PhoneContactFormValues, ProjectChoice } from "./types";

export function emptyContactForm(): PhoneContactFormValues {
  return { nameEn: "", nameAr: "", phone: "", project: "", status: "draft" };
}

export function contactToForm(contact: PhoneContact): PhoneContactFormValues {
  return {
    nameEn: contact.nameEn,
    nameAr: contact.nameAr,
    phone: contact.phone,
    project: String(contact.projectId),
    status: contact.published ? "published" : "draft",
  };
}

/**
 * The form's projects: "All Projects", the employee's own, and the contact's when the list
 * doesn't offer it (an inactive one, say). Only the Super Admin may save to "All Projects"; the
 * API refuses it for anyone else.
 */
export function contactProjectChoices(
  choices: ProjectChoice[],
  allProjectsLabel: string,
  contact: PhoneContact | null,
): ProjectChoice[] {
  const all = [{ value: String(ALL_PROJECTS_ID), label: allProjectsLabel }, ...choices];
  if (!contact || all.some((choice) => choice.value === String(contact.projectId))) return all;
  return [...all, { value: String(contact.projectId), label: contact.projectName ?? `#${contact.projectId}` }];
}

export function validateContactForm(values: PhoneContactFormValues): PhoneContactFormErrors {
  const errors: PhoneContactFormErrors = {};
  for (const field of ["nameEn", "nameAr"] as const) {
    const value = values[field].trim();
    if (!value) errors[field] = "required";
    else if (value.length > PHONE_CONTACT_NAME_MAX) errors[field] = "tooLong";
  }
  if (!values.phone.trim()) errors.phone = "required";
  else if (!isValidPhoneNumber(values.phone)) errors.phone = "phone";
  if (!values.project) errors.project = "required";
  return errors;
}

/** Call it once `validateContactForm` finds nothing. */
export function buildContactInput(values: PhoneContactFormValues): PhoneContactInput {
  return {
    projectId: Number(values.project),
    nameEn: values.nameEn,
    nameAr: values.nameAr,
    phone: values.phone,
    published: values.status === "published",
  };
}

/** Only what changed, so an unchanged contact isn't written again; null when nothing did. */
export function buildContactChanges(
  contact: PhoneContact,
  values: PhoneContactFormValues,
): Partial<PhoneContactInput> | null {
  const input = buildContactInput(values);
  const changes: Partial<PhoneContactInput> = {
    ...(input.projectId !== contact.projectId && { projectId: input.projectId }),
    ...(input.nameEn.trim() !== contact.nameEn && { nameEn: input.nameEn }),
    ...(input.nameAr.trim() !== contact.nameAr && { nameAr: input.nameAr }),
    ...(normalizePhoneNumber(input.phone) !== contact.phone && { phone: input.phone }),
    ...(input.published !== contact.published && { published: input.published }),
  };
  return Object.keys(changes).length > 0 ? changes : null;
}
