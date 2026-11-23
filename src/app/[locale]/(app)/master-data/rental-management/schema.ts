import type { RentableUnit } from "@/src/services/rentals";
import type { RentalDialogMode, RentalDialogValues, NewRentalValues } from "./types";

/**
 * The form rules, mirroring the API's DTOs (CreateRentalTenantDto, CheckOutDto,
 * ExtendRentDto, TerminateRentDto, RejectWalkInRequestDto) so a mistake shows before the
 * request instead of as a 400.
 */

export type NewRentalProblem =
  | "required"
  | "idNumberLength"
  | "endBeforeStart"
  | "noRentalCompany";

/** The first problem with a new rental, or null when it can be sent. */
export function newRentalProblem(values: NewRentalValues, unit: RentableUnit | null): NewRentalProblem | null {
  if (
    values.projectId === null ||
    !unit ||
    !values.customerName.trim() ||
    !values.idNumber.trim() ||
    !values.startDate ||
    !values.endDate
  ) {
    return "required";
  }
  const idLength = values.idNumber.trim().length;
  if (idLength < 8 || idLength > 14) return "idNumberLength";
  // The mobile number is left to the API, which normalizes it (+20 ...) before checking it.
  if (values.endDate <= values.startDate) return "endBeforeStart";
  if (unit.rentalCompanyId === null) return "noRentalCompany";
  return null;
}

/** An optional amount: empty is none, otherwise a number of 0 or more. */
export function parsePenalty(text: string): number | null | "invalid" {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) && amount >= 0 ? amount : "invalid";
}

export type RentalDialogProblem = "rating" | "penalty" | "newEndDate" | "reason";

/** The first problem with a dialog's fields, or null. */
export function rentalDialogProblem(
  mode: RentalDialogMode,
  values: RentalDialogValues,
): RentalDialogProblem | null {
  switch (mode) {
    case "checkOut": {
      const rating = Number(values.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "rating";
      return parsePenalty(values.penalty) === "invalid" ? "penalty" : null;
    }
    case "terminate":
      if (!values.reason.trim()) return "reason";
      return parsePenalty(values.penalty) === "invalid" ? "penalty" : null;
    case "extend":
      return /^\d{4}-\d{2}-\d{2}$/.test(values.newEndDate) ? null : "newEndDate";
    case "reject":
      return values.reason.trim() ? null : "reason";
    default:
      return null;
  }
}
