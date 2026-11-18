export type ServiceItem = {
  id: string;
  name: string;
  department: string;
  description: string;
  baseCost: number;
  currency: string;
  active: boolean;
};

// TODO: replace with real API call
export async function fetchServiceCatalog(): Promise<ServiceItem[]> {
  return [
    { id: "1", name: "HVAC Maintenance", department: "Facility Management", description: "Air conditioning inspection and repair.", baseCost: 250, currency: "EGP", active: true },
    { id: "2", name: "Plumbing Repair", department: "Facility Management", description: "Plumbing fault diagnosis and repair.", baseCost: 150, currency: "EGP", active: true },
    { id: "3", name: "Community Support", department: "Customer Relations", description: "Resident support and assistance.", baseCost: 0, currency: "EGP", active: true },
    { id: "4", name: "Landscape Maintenance", department: "Landscaping", description: "Landscape and irrigation maintenance.", baseCost: 500, currency: "EGP", active: false },
  ];
}

// TODO: replace with real API call
export async function fetchServiceCatalogDepartmentOptions(): Promise<{ value: string; label: string }[]> {
  return [
    { value: "facility-management", label: "Facility Management" },
    { value: "customer-relations", label: "Customer Relations" },
    { value: "landscaping", label: "Landscaping" },
    { value: "security", label: "Security" },
    { value: "finance-&-accounts", label: "Finance & Accounts" },
  ];
}

// TODO: replace with real API call
export async function fetchServiceCatalogStatusOptions(): Promise<{ value: string; label: string }[]> {
  return [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];
}
