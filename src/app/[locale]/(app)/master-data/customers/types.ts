export type {
  Customer,
  CustomerAttachment,
  CustomerDetail,
  CustomerFilters,
  CustomerSearchField,
  CustomerUnit,
  ImportJob,
  ImportKind,
  Named,
  QueuedImport,
} from "@/src/services/customers";

/** The add and edit forms' values. Lookup ids stay strings ("" = not chosen) until saved. */
export type CustomerFormValues = {
  name: string;
  mobile: string;
  email: string;
  idTypeId: string;
  idNumber: string;
  countryId: string;
  customerTypeId: string;
  maritalStatusId: string;
  religionId: string;
  /** Add only: the project the customer joins. */
  projectId: string;
};

export type CustomerFormField = keyof CustomerFormValues;
