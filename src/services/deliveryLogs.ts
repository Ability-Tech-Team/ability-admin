export type DeliveryLog = {
  id: string;
  notification: string;
  sentAt: string;
  recipients: number;
  delivered: number;
  read: number;
  failed: number;
  readRate: number;
};

// TODO: replace with real API call
export async function fetchDeliveryLogs(): Promise<DeliveryLog[]> {
  return [
    {
      id: "1",
      notification: "Scheduled Maintenance Notice",
      sentAt: "2024-11-26 14:30",
      recipients: 285,
      delivered: 281,
      read: 198,
      failed: 4,
      readRate: 69,
    },
    {
      id: "2",
      notification: "Overdue Invoice Reminder",
      sentAt: "2024-11-25 09:00",
      recipients: 42,
      delivered: 41,
      read: 35,
      failed: 1,
      readRate: 83,
    },
  ];
}
