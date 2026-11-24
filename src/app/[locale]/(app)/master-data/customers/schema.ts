import { OWNERSHIP_IDS } from "@/src/services/customers";
import type { Dropdowns } from "@/src/services/definitions";
import type { CustomerFormField, CustomerSearchField } from "./types";

/** A fixed choice labelled by this app's translation (`labelKey`). */
export type LookupOption = { id: number; labelKey: string };

/**
 * The customer form's fields chosen from a list (id type, nationality, customer type, marital
 * status, religion), each filled from its definitions list (`GET /definitions/all-dropdowns`).
 */
export type CustomerLookupField = Extract<
  CustomerFormField,
  "idTypeId" | "countryId" | "customerTypeId" | "maritalStatusId" | "religionId"
>;

/** Which definitions list each of those fields picks from. */
export const CUSTOMER_LOOKUP_LISTS: Record<CustomerLookupField, keyof Dropdowns> = {
  idTypeId: "idTypes",
  countryId: "countries",
  customerTypeId: "customerTypes",
  maritalStatusId: "maritalStatuses",
  religionId: "religions",
};

/** The list's type filter: `ownership_id`, labelled with `MasterData.customerTypes`. */
export const OWNERSHIP_FILTER_OPTIONS: LookupOption[] = [
  { id: OWNERSHIP_IDS.owner, labelKey: "owner" },
  { id: OWNERSHIP_IDS.renter, labelKey: "tenant" },
];

/** The search box's fields, labelled with `CustomersScreen.searchFields`. */
export const SEARCH_FIELDS: CustomerSearchField[] = ["name", "mobile", "idNumber", "unit", "code"];
