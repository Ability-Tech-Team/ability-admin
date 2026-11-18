export type Department = {
  id: string;
  nameEn: string;
  nameAr: string;
  head: string;
  staff: number;
  active: boolean;
};

// TODO: replace with real API call
export async function fetchDepartments(): Promise<Department[]> {
  return [
    { id: "1", nameEn: "Facility Management", nameAr: "إدارة المرافق", head: "Rashed Al Blooshi", staff: 24, active: true },
    { id: "2", nameEn: "Customer Relations", nameAr: "علاقات العملاء", head: "Ameera Obaid", staff: 8, active: true },
    { id: "3", nameEn: "Finance & Accounts", nameAr: "المالية والحسابات", head: "Dana Al Shehhi", staff: 5, active: true },
    { id: "4", nameEn: "Security", nameAr: "الأمن", head: "Ali Hassan", staff: 18, active: true },
    { id: "5", nameEn: "Landscaping", nameAr: "تنسيق الحدائق", head: "TBA", staff: 12, active: false },
  ];
}
