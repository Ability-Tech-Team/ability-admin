export type NotificationTemplate = {
  id: string;
  name: string;
  type: "announcement" | "push";
  body: string;
  uses: number;
};

// TODO: replace with real API call
export async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
  return [
    {
      id: "1",
      name: "Maintenance Notice",
      type: "announcement",
      body: "Dear [Resident Name], we would like to inform you about [topic] at [Project]...",
      uses: 24,
    },
    {
      id: "2",
      name: "Invoice Reminder",
      type: "push",
      body: "Dear [Resident Name], we would like to inform you about [topic] at [Project]...",
      uses: 156,
    },
    {
      id: "3",
      name: "Event Invitation",
      type: "announcement",
      body: "Dear [Resident Name], we would like to inform you about [topic] at [Project]...",
      uses: 8,
    },
    {
      id: "4",
      name: "Welcome to the Community",
      type: "push",
      body: "Dear [Resident Name], we would like to inform you about [topic] at [Project]...",
      uses: 412,
    },
    {
      id: "5",
      name: "SR Resolved",
      type: "push",
      body: "Dear [Resident Name], we would like to inform you about [topic] at [Project]...",
      uses: 234,
    },
  ];
}
