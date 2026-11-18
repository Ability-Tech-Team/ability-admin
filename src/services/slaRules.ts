export type SlaRule = {
  id: string;
  service: string;
  priority: "critical" | "high" | "medium" | "low";
  slaHours: number;
  escalationTo: string;
};

// TODO: replace with real API call
export async function fetchSlaRules(): Promise<SlaRule[]> {
  return [
    { id: "1", service: "Critical Infrastructure", priority: "critical", slaHours: 2, escalationTo: "FM Manager" },
    { id: "2", service: "HVAC Maintenance", priority: "high", slaHours: 4, escalationTo: "Operations Lead" },
    { id: "3", service: "General Maintenance", priority: "medium", slaHours: 8, escalationTo: "Team Lead" },
    { id: "4", service: "Cosmetic / Minor Repair", priority: "low", slaHours: 24, escalationTo: "Technician" },
  ];
}
