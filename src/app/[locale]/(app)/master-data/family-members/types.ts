export type {
  FamilyMemberAttachment,
  FamilyMemberFilters,
  FamilyMemberRequest,
  FamilyMemberSearchField,
  RequestStatus,
} from "@/src/services/familyMembers";

/** An answer to a request, from its row's buttons. */
export type FamilyMemberAction = "accept" | "reject" | "revert";
