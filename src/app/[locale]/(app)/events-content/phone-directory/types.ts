/** A choice in the form's project select (value: the project id). */
export type ProjectChoice = { value: string; label: string };

/** The contact form's fields, as typed. */
export type PhoneContactFormValues = {
  nameEn: string;
  nameAr: string;
  phone: string;
  /** A project id; "" until one is chosen. */
  project: string;
  status: "draft" | "published";
};

/** Why a field can't be saved; each has an `EventsContent.phoneDir.form.errors.*` label. */
export type PhoneContactFormError = "required" | "tooLong" | "phone";

export type PhoneContactFormErrors = Partial<
  Record<"nameEn" | "nameAr" | "phone" | "project", PhoneContactFormError>
>;

export type PhoneContactModalState = { mode: "create" } | { mode: "edit"; contactId: number } | null;
