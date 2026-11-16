export type FamilyMemberRecord = {
  id: string;
  name: string;
  ownerName: string;
  idType: "id" | "passport";
  idNumber: string;
  assignedUnit: string;
  project: string;
  relationship: string;
  mobile: string;
  email: string;
  requestStatus: "pending" | "approved" | "rejected";
  attachments: string[];
};

// TODO: replace with real API call
export async function fetchFamilyMembers(): Promise<FamilyMemberRecord[]> {
  return [
    { id: "1", name: "Mariam Al Rashidi", ownerName: "Ahmed Al Rashidi", idType: "id", idNumber: "29801011234567", assignedUnit: "301", project: "Marina Heights", relationship: "Spouse", mobile: "+20 101 234 5678", email: "mariam@email.com", requestStatus: "pending", attachments: ["mariam-id.pdf", "relationship-document.pdf"] },
    { id: "2", name: "Omar Al Rashidi", ownerName: "Ahmed Al Rashidi", idType: "id", idNumber: "31505221234567", assignedUnit: "301", project: "Marina Heights", relationship: "Son", mobile: "+20 111 222 3344", email: "omar@email.com", requestStatus: "approved", attachments: ["omar-id.pdf", "birth-certificate.pdf"] },
  ];
}
