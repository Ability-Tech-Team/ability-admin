export type InvoiceStats = {
  totalOutstanding: number;
  overdueAmount: number;
  collectedThisMonth: number;
};

export type Invoice = {
  id: string;
  invoiceId: string;
  customer: string;
  project: string;
  unit: string;
  invoiceType: "annual-rent" | "monthly-rent" | "service-charge";
  amount: number;
  currency: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
};

// TODO: replace with real API call
export async function fetchInvoiceStats(): Promise<InvoiceStats> {
  return { totalOutstanding: 118000, overdueAmount: 100000, collectedThisMonth: 125000 };
}

export type MaintenanceDeposit = {
  unit: string;
  current: number;
  required: number;
  difference: number;
};

// TODO: replace with real API call
export async function fetchMaintenanceDeposits(): Promise<MaintenanceDeposit[]> {
  return [
    { unit: "301", current: 20000, required: 25000, difference: 5000 },
    { unit: "502", current: 15000, required: 20000, difference: 5000 },
  ];
}

// TODO: replace with real API call
export async function fetchInvoices(): Promise<Invoice[]> {
  return [
    { id: "1", invoiceId: "INV-2024-4521", customer: "Ahmed Al Rashidi", project: "Marina Heights", unit: "301", invoiceType: "annual-rent", amount: 85000, currency: "EGP", dueDate: "2024-12-01", status: "overdue" },
    { id: "2", invoiceId: "INV-2024-4520", customer: "Fatima Al Suwaidi", project: "Marina Heights", unit: "502", invoiceType: "annual-rent", amount: 125000, currency: "EGP", dueDate: "2024-11-30", status: "paid" },
    { id: "3", invoiceId: "INV-2024-4519", customer: "Mohammed Al Zaabi", project: "Corniche Gardens", unit: "V12", invoiceType: "monthly-rent", amount: 18000, currency: "EGP", dueDate: "2024-12-05", status: "pending" },
    { id: "4", invoiceId: "INV-2024-4518", customer: "James Mitchell", project: "Palm Residences", unit: "801", invoiceType: "service-charge", amount: 15000, currency: "EGP", dueDate: "2024-11-25", status: "overdue" },
  ];
}
