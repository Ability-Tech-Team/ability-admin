export type ComplaintTimelineEntry = {
  action: string;
  detail: string;
  date: string;
};

export type Complaint = {
  id: string;
  complaintId: string;
  subject: string;
  description: string;
  fullDescription: string;
  project: string;
  unit: string;
  submittedBy: string;
  assignedTo: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved";
  date: string;
  hasVoiceNote: boolean;
  voiceNoteDuration: string;
  timeline: ComplaintTimelineEntry[];
};

// TODO: replace with real API call
export async function fetchComplaints(): Promise<Complaint[]> {
  return [
    {
      id: "1", complaintId: "CMP-2024-0412", subject: "Noise from neighbors above", description: "Persistent noise after community quiet h...", fullDescription: "Persistent noise after community quiet hours from the unit above.", project: "Marina Heights", unit: "301", submittedBy: "Ahmed Al Rashidi", assignedTo: "Community Manager", priority: "medium", status: "in-progress", date: "2024-11-27", hasVoiceNote: false, voiceNoteDuration: "",
      timeline: [
        { action: "Complaint Submitted From Ability App", detail: "Ahmed Al Rashidi", date: "2024-11-27 · 08:15" },
        { action: "Assigned To Community Manager", detail: "Operations workflow", date: "2024-11-27 · 08:30" },
        { action: "Status: In Progress", detail: "Latest update", date: "2024-11-27 · 09:00" },
      ],
    },
    {
      id: "2", complaintId: "CMP-2024-0411", subject: "Parking space occupied", description: "Assigned parking bay is used by an una...", fullDescription: "Assigned parking bay is used by an unauthorized vehicle.", project: "Palm Residences", unit: "V12", submittedBy: "James Mitchell", assignedTo: "Unassigned", priority: "high", status: "open", date: "2024-11-26", hasVoiceNote: true, voiceNoteDuration: "00:21",
      timeline: [
        { action: "Complaint Submitted From Ability App", detail: "James Mitchell", date: "2024-11-26 · 09:20" },
        { action: "Voice Note Attached By Customer", detail: "Customer voice message", date: "2024-11-26 · 09:21" },
        { action: "Waiting For Assignment", detail: "Operations workflow", date: "2024-11-26 · 09:35" },
        { action: "Status: Open", detail: "Latest update", date: "Today · 10:15" },
      ],
    },
    {
      id: "3", complaintId: "CMP-2024-0410", subject: "Pool maintenance quality", description: "Pool cleaning quality requires review.", fullDescription: "Pool cleaning quality requires review.", project: "Corniche Gardens", unit: "801", submittedBy: "Mohammed Al Zaabi", assignedTo: "Facilities Team", priority: "low", status: "resolved", date: "2024-11-20", hasVoiceNote: false, voiceNoteDuration: "",
      timeline: [
        { action: "Complaint Submitted From Ability App", detail: "Mohammed Al Zaabi", date: "2024-11-20 · 11:00" },
        { action: "Assigned To Facilities Team", detail: "Operations workflow", date: "2024-11-20 · 11:15" },
        { action: "Status: Resolved", detail: "Latest update", date: "2024-11-22 · 14:00" },
      ],
    },
    {
      id: "4", complaintId: "CMP-2024-0409", subject: "Security guard misconduct", description: "Resident reported an inappropriate inter...", fullDescription: "Resident reported an inappropriate interaction with security personnel.", project: "Downtown Towers", unit: "2201", submittedBy: "Priya Sharma", assignedTo: "HR Department", priority: "high", status: "in-progress", date: "2024-11-25", hasVoiceNote: false, voiceNoteDuration: "",
      timeline: [
        { action: "Complaint Submitted From Ability App", detail: "Priya Sharma", date: "2024-11-25 · 16:00" },
        { action: "Assigned To HR Department", detail: "Operations workflow", date: "2024-11-25 · 16:20" },
        { action: "Status: In Progress", detail: "Latest update", date: "2024-11-25 · 17:00" },
      ],
    },
  ];
}
