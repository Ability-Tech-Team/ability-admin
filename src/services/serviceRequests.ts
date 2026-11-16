export type ServiceRequestStats = {
  open: number;
  inProgress: number;
  critical: number;
  overdueSla: number;
};

export type TimelineEntry = {
  action: string;
  actor: string;
  date: string;
};

export type ServiceRequest = {
  id: string;
  requestId: string;
  title: string;
  category: string;
  subcategory: string;
  project: string;
  unit: string;
  customer: string;
  type: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  dueTime: string;
  status: "open" | "in-progress" | "resolved" | "delayed";
  timeline: TimelineEntry[];
};

// TODO: replace with real API call
export async function fetchServiceRequestStats(): Promise<ServiceRequestStats> {
  return { open: 12, inProgress: 18, critical: 3, overdueSla: 7 };
}

// TODO: replace with real API call
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  return [
    {
      id: "1", requestId: "SR-2024-0891", title: "AC unit not cooling", category: "HVAC", subcategory: "Maintenance", project: "Marina Heights", unit: "301", customer: "Ahmed Al Rashidi", type: "HVAC", assignedTo: "Tariq Yusuf", createdDate: "2024-11-27", dueDate: "2024-12-01", dueTime: "09:00", status: "in-progress",
      timeline: [
        { action: "Status changed to In-Progress", actor: "Tariq Yusuf", date: "2024-11-28 09:32" },
        { action: "Request assigned to Tariq Yusuf", actor: "System", date: "2024-11-28 09:15" },
        { action: "Request submitted via mobile app", actor: "Ahmed Al Rashidi", date: "2024-11-28 08:40" },
      ],
    },
    {
      id: "2", requestId: "SR-2024-0890", title: "Water heater replacement", category: "Plumbing", subcategory: "Maintenance", project: "Palm Residences", unit: "V12", customer: "James Mitchell", type: "Plumbing", assignedTo: "Unassigned", createdDate: "2024-11-27", dueDate: "2024-12-02", dueTime: "10:30", status: "open",
      timeline: [
        { action: "Status changed to In-Progress", actor: "Tariq Yusuf", date: "2024-11-28 09:32" },
        { action: "Request assigned to Tariq Yusuf", actor: "System", date: "2024-11-28 09:15" },
        { action: "Request submitted via mobile app", actor: "Ahmed Al Rashidi", date: "2024-11-28 08:40" },
      ],
    },
    {
      id: "3", requestId: "SR-2024-0889", title: "Parking access card issue", category: "Access", subcategory: "Access", project: "Corniche Gardens", unit: "801", customer: "Mohammed Al Zaabi", type: "Access", assignedTo: "Salim Noor", createdDate: "2024-11-25", dueDate: "2024-11-28", dueTime: "13:00", status: "resolved",
      timeline: [
        { action: "Status changed to Resolved", actor: "Salim Noor", date: "2024-11-27 16:00" },
        { action: "Request assigned to Salim Noor", actor: "System", date: "2024-11-25 10:00" },
        { action: "Request submitted via mobile app", actor: "Mohammed Al Zaabi", date: "2024-11-25 09:30" },
      ],
    },
    {
      id: "4", requestId: "SR-2024-0888", title: "Elevator malfunction - Tower B", category: "Elevator", subcategory: "Infrastructure", project: "Marina Heights", unit: "Common", customer: "Building Management", type: "Elevator", assignedTo: "Tariq Yusuf", createdDate: "2024-11-26", dueDate: "2024-11-29", dueTime: "15:30", status: "in-progress",
      timeline: [
        { action: "Status changed to In-Progress", actor: "Tariq Yusuf", date: "2024-11-27 11:00" },
        { action: "Request assigned to Tariq Yusuf", actor: "System", date: "2024-11-26 14:00" },
        { action: "Request submitted via admin panel", actor: "Building Management", date: "2024-11-26 13:45" },
      ],
    },
    {
      id: "5", requestId: "SR-2024-0887", title: "Light fixture replacement", category: "Electrical", subcategory: "Maintenance", project: "Downtown Towers", unit: "2201", customer: "Priya Sharma", type: "Electrical", assignedTo: "Unassigned", createdDate: "2024-11-28", dueDate: "2024-12-03", dueTime: "09:00", status: "delayed",
      timeline: [
        { action: "Request submitted via mobile app", actor: "Priya Sharma", date: "2024-11-28 08:00" },
      ],
    },
  ];
}
