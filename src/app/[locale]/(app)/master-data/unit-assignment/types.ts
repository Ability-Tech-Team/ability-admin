import type { CustomerOption, OwnershipId } from "@/src/services/unitAssignments";

/** The assign form, as typed. Dates are `YYYY-MM-DD` from date inputs. */
export type AssignFormValues = {
  /** "" until a project is picked. */
  projectId: string;
  unitNumber: string;
  customer: CustomerOption | null;
  ownershipId: OwnershipId;
  contractNumber: string;
  signDate: string;
  startDate: string;
  endDate: string;
};

/** Why a field can't be saved; each has an `UnitAssignmentScreen.errors.*` label. */
export type AssignFormError = "required" | "endBeforeStart";

export type AssignFormErrors = Partial<
  Record<"projectId" | "unitNumber" | "customer" | "contractNumber" | "signDate" | "startDate" | "endDate", AssignFormError>
>;
