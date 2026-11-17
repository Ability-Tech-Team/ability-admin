export type Notification = {
  id: string;
  titleEn: string;
  titleAr: string;
  type: "announcement" | "push";
  project: string;
  audience: string;
  status: "published" | "scheduled" | "draft";
  sentCount?: number;
  readCount?: number;
  readPercent?: number;
  createdAt: string;
};

// TODO: replace with real API call
export async function fetchNotifications(): Promise<Notification[]> {
  return [
    {
      id: "1",
      titleEn: "Community Pool Maintenance",
      titleAr: "صيانة حمام السباحة المجتمعي",
      type: "announcement",
      project: "Marina Heights",
      audience: "All Residents",
      status: "published",
      sentCount: 1240,
      readCount: 892,
      readPercent: 72,
      createdAt: "2024-11-28",
    },
    {
      id: "2",
      titleEn: "Parking Area Update",
      titleAr: "تحديث منطقة المواقف",
      type: "push",
      project: "Palm Residences",
      audience: "Unit Owners",
      status: "published",
      sentCount: 430,
      readCount: 318,
      readPercent: 74,
      createdAt: "2024-11-27",
    },
    {
      id: "3",
      titleEn: "Holiday Schedule Notice",
      titleAr: "إشعار جدول العطلات",
      type: "announcement",
      project: "Downtown Towers",
      audience: "All Residents",
      status: "scheduled",
      createdAt: "2024-12-01",
    },
    {
      id: "4",
      titleEn: "Security System Upgrade",
      titleAr: "ترقية نظام الأمان",
      type: "push",
      project: "Marina Heights",
      audience: "All Residents",
      status: "draft",
      createdAt: "2024-11-26",
    },
  ];
}
