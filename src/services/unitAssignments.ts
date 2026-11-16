export type FamilyMember = {
  name: string;
  initials: string;
  avatarColor: string;
};

export type UnitAssignment = {
  id: string;
  assignmentId: string;
  unitNumber: string;
  customerName: string;
  customerExtra?: number;
  familyMember?: FamilyMember;
  familyExtra?: number;
  project: string;
  occupancyType: "owner" | "tenant";
  startDate: string;
  active: boolean;
  detail: AssignmentDetail;
};

export type AssignmentDetail = {
  customers: AssignmentCustomer[];
  familyMembers: AssignmentFamilyMember[];
};

export type AssignmentCustomer = {
  name: string;
  nameAr: string;
  role: "owner" | "co-owner" | "tenant";
  active: boolean;
  nationalId: string;
  mobile: string;
  email: string;
  nationality: string;
  assignmentStart: string;
  attachments: string[];
};

export type AssignmentFamilyMember = {
  name: string;
  relationship: string;
  status: "approved" | "pending";
  nationalId: string;
  mobile: string;
  email: string;
  attachments: string[];
};

// TODO: replace with real API call
export async function fetchUnitAssignments(): Promise<UnitAssignment[]> {
  return [
    {
      id: "1", assignmentId: "ASG-001", unitNumber: "301", customerName: "Ahmed Al Rashidi", customerExtra: 1,
      familyMember: { name: "Mariam Al Rashidi", initials: "MA", avatarColor: "bg-indigo-400" }, familyExtra: 1,
      project: "Marina Heights", occupancyType: "owner", startDate: "2022-03-15", active: true,
      detail: {
        customers: [
          { name: "Ahmed Al Rashidi", nameAr: "أحمد الراشدي", role: "owner", active: true, nationalId: "29801011234567", mobile: "+20 101 234 5678", email: "ahmed.al.rashidi@email.com", nationality: "Egyptian", assignmentStart: "2022-03-15", attachments: ["identity-document.pdf", "ownership-or-rental-contract.pdf"] },
          { name: "Nadia Al Rashidi", nameAr: "نادية الراشدي", role: "co-owner", active: true, nationalId: "29908221234567", mobile: "+20 112 345 6789", email: "nadia.rashidi@email.com", nationality: "Egyptian", assignmentStart: "2022-03-15", attachments: ["nadia-identity.pdf", "co-ownership-document.pdf"] },
        ],
        familyMembers: [
          { name: "Mariam Al Rashidi", relationship: "Spouse", status: "approved", nationalId: "29801019876543", mobile: "+20 101 234 5678", email: "mariam@email.com", attachments: ["mariam-id.pdf", "relationship-document.pdf"] },
          { name: "Omar Al Rashidi", relationship: "Son", status: "approved", nationalId: "31505221234567", mobile: "+20 111 222 3344", email: "omar@email.com", attachments: ["omar-id.pdf", "birth-certificate.pdf"] },
        ],
      },
    },
    {
      id: "2", assignmentId: "ASG-002", unitNumber: "502", customerName: "Fatima Al Suwaidi", customerExtra: 2,
      familyMember: { name: "Yousef Al Suwaidi", initials: "YA", avatarColor: "bg-orange-400" }, familyExtra: 1,
      project: "Marina Heights", occupancyType: "tenant", startDate: "2024-01-01", active: true,
      detail: {
        customers: [
          { name: "Fatima Al Suwaidi", nameAr: "فاطمة السويدي", role: "tenant", active: true, nationalId: "30105151234567", mobile: "+20 100 555 1234", email: "fatima.suwaidi@email.com", nationality: "Emirati", assignmentStart: "2024-01-01", attachments: ["fatima-id.pdf", "rental-contract.pdf"] },
        ],
        familyMembers: [
          { name: "Yousef Al Suwaidi", relationship: "Son", status: "approved", nationalId: "31201011234567", mobile: "+20 100 555 5678", email: "yousef@email.com", attachments: ["yousef-id.pdf"] },
        ],
      },
    },
    {
      id: "3", assignmentId: "ASG-003", unitNumber: "V12", customerName: "James Mitchell",
      familyMember: { name: "Emma Mitchell", initials: "EM", avatarColor: "bg-emerald-500" },
      project: "Palm Residences", occupancyType: "tenant", startDate: "2024-06-10", active: false,
      detail: {
        customers: [
          { name: "James Mitchell", nameAr: "جيمس ميتشل", role: "tenant", active: false, nationalId: "A12345678", mobile: "+971 50 123 4567", email: "james.mitchell@email.com", nationality: "British", assignmentStart: "2024-06-10", attachments: ["passport-james.pdf", "rental-agreement.pdf"] },
        ],
        familyMembers: [
          { name: "Emma Mitchell", relationship: "Spouse", status: "approved", nationalId: "B98765432", mobile: "+971 50 765 4321", email: "emma@email.com", attachments: ["emma-passport.pdf"] },
        ],
      },
    },
    {
      id: "4", assignmentId: "ASG-004", unitNumber: "801", customerName: "Mohammed Al Zaabi", customerExtra: 1,
      familyMember: { name: "Salma Al Zaabi", initials: "SA", avatarColor: "bg-blue-500" }, familyExtra: 1,
      project: "Corniche Gardens", occupancyType: "owner", startDate: "2020-11-20", active: true,
      detail: {
        customers: [
          { name: "Mohammed Al Zaabi", nameAr: "محمد الزعابي", role: "owner", active: true, nationalId: "28501011234567", mobile: "+971 55 987 6543", email: "mohammed.zaabi@email.com", nationality: "Emirati", assignmentStart: "2020-11-20", attachments: ["mohammed-id.pdf", "ownership-deed.pdf"] },
        ],
        familyMembers: [
          { name: "Salma Al Zaabi", relationship: "Spouse", status: "approved", nationalId: "29001011234567", mobile: "+971 55 111 2233", email: "salma@email.com", attachments: ["salma-id.pdf", "marriage-cert.pdf"] },
        ],
      },
    },
  ];
}
