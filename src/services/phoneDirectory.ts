export type PhoneContact = {
  id: string;
  name: string;
  phone: string;
  category: "emergency" | "main" | "project" | "direct" | "security" | "operations";
  project: string;
};

// TODO: replace with real API call
export async function fetchPhoneContacts(): Promise<PhoneContact[]> {
  return [
    { id: "1", name: "Emergency Line", phone: "999", category: "emergency", project: "All" },
    { id: "2", name: "FM Operations", phone: "+971 4 123 4567", category: "main", project: "All" },
    { id: "3", name: "Marina Heights FM", phone: "+971 4 234 5678", category: "project", project: "Marina Heights" },
    { id: "4", name: "Community Manager", phone: "+971 50 987 6543", category: "direct", project: "All" },
    { id: "5", name: "Security Desk", phone: "+971 4 345 6789", category: "security", project: "All" },
    { id: "6", name: "Maintenance", phone: "+971 50 123 4567", category: "operations", project: "All" },
  ];
}
