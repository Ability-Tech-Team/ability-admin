export type Attachment = {
  name: string;
  fileName: string;
};

export type Customer = {
  id: string;
  name: string;
  nameAr: string;
  initials: string;
  avatarColor: string;
  idType: "id" | "passport";
  idNumber: string;
  email: string;
  phone: string;
  project: string;
  unit: string;
  nationality: string;
  customerType: "owner" | "tenant";
  joinDate: string;
  active: boolean;
  attachments: Attachment[];
};

// TODO: replace with real API call
export async function fetchCustomers(): Promise<Customer[]> {
  return [
    { id: "1", name: "Ahmed Al Rashidi", nameAr: "أحمد الراشدي", initials: "AA", avatarColor: "bg-emerald-500", idType: "id", idNumber: "784-1985-1234567-1", email: "ahmed.rashidi@email.com", phone: "+971 50 123 4567", project: "Marina Heights", unit: "Marina Heights - 301", nationality: "Emirati", customerType: "owner", joinDate: "2022-03-15", active: true, attachments: [{ name: "ID Document", fileName: "identity-document.pdf" }, { name: "Ownership / Assignment Document", fileName: "unit-assignment-C001.pdf" }] },
    { id: "2", name: "Fatima Al Suwaidi", nameAr: "فاطمة السويدي", initials: "FA", avatarColor: "bg-rose-500", idType: "id", idNumber: "784-1990-2345678-2", email: "fatima.suwaidi@email.com", phone: "+971 55 234 5678", project: "Marina Heights", unit: "Marina Heights - 502", nationality: "Emirati", customerType: "owner", joinDate: "2021-07-01", active: true, attachments: [{ name: "ID Document", fileName: "identity-document.pdf" }] },
    { id: "3", name: "James Mitchell", nameAr: "جيمس ميتشل", initials: "JM", avatarColor: "bg-emerald-500", idType: "passport", idNumber: "GB12345678", email: "james.m@email.com", phone: "+971 52 345 6789", project: "Palm Residences", unit: "Palm Residences - V12", nationality: "British", customerType: "owner", joinDate: "2024-01-10", active: false, attachments: [{ name: "Passport Document", fileName: "identity-document.pdf" }, { name: "Ownership / Assignment Document", fileName: "unit-assignment-C003.pdf" }] },
    { id: "4", name: "Mohammed Al Zaabi", nameAr: "محمد الظابي", initials: "MA", avatarColor: "bg-emerald-500", idType: "id", idNumber: "784-1978-3456789-3", email: "mzaabi@email.com", phone: "+971 54 456 7890", project: "Corniche Gardens", unit: "Corniche Gardens - 801", nationality: "Emirati", customerType: "owner", joinDate: "2020-11-20", active: true, attachments: [{ name: "ID Document", fileName: "identity-document.pdf" }, { name: "Ownership / Assignment Document", fileName: "unit-assignment-C004.pdf" }] },
    { id: "5", name: "Priya Sharma", nameAr: "بريا شارما", initials: "PS", avatarColor: "bg-emerald-500", idType: "passport", idNumber: "A1234567", email: "priya.s@email.com", phone: "+971 56 567 8901", project: "Downtown Towers", unit: "Downtown Towers - 2201", nationality: "Indian", customerType: "owner", joinDate: "2023-05-08", active: false, attachments: [{ name: "Passport Document", fileName: "identity-document.pdf" }] },
  ];
}
