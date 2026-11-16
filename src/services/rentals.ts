export type Rental = {
  id: string;
  rentalId: string;
  unit: string;
  project: string;
  tenantName: string;
  idType: "id" | "passport";
  idNumber: string;
  startDate: string;
  endDate: string;
  annualRent: string;
  source: "App" | "Admin";
  status: "pending" | "approved" | "rejected";
};

// TODO: replace with real API call
export async function fetchRentals(): Promise<Rental[]> {
  return [
    { id: "1", rentalId: "RNT-001", unit: "502", project: "Marina Heights", tenantName: "Fatima Al Suwaidi", idType: "passport", idNumber: "A29874122", startDate: "2024-01-01", endDate: "2024-12-31", annualRent: "EGP 125,000", source: "App", status: "pending" },
    { id: "2", rentalId: "RNT-002", unit: "801", project: "Corniche Gardens", tenantName: "Mohammed Al Zaabi", idType: "id", idNumber: "29804151234567", startDate: "2024-03-01", endDate: "2025-02-28", annualRent: "EGP 216,000", source: "Admin", status: "approved" },
  ];
}
