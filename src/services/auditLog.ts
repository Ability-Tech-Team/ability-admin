export type AuditLogStats = {
  actionsToday: number;
  thisWeek: number;
  activeAdminsToday: number;
  contentPublished: number;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  actionColor: string;
  module: string;
  moduleBadgeColor: string;
  userName: string;
  userInitials: string;
  userInitialsColor: string;
  detail: string;
  ipAddress: string;
};

// TODO: replace with real API call
export async function fetchAuditLogStats(): Promise<AuditLogStats> {
  return {
    actionsToday: 24,
    thisWeek: 147,
    activeAdminsToday: 4,
    contentPublished: 8,
  };
}

// TODO: replace with real API call
export async function fetchAuditModuleOptions(): Promise<{ value: string; label: string }[]> {
  return [
    { value: "app-builder", label: "App Builder" },
    { value: "cms", label: "CMS" },
    { value: "users", label: "Users" },
    { value: "service-requests", label: "Service Requests" },
    { value: "notifications", label: "Notifications" },
    { value: "home-builder", label: "Home Builder" },
    { value: "invoices", label: "Invoices" },
    { value: "master-data", label: "Master Data" },
  ];
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  return [
    {
      id: "1",
      timestamp: "2024-11-28  09:32:15",
      action: "Section Reordered",
      actionColor: "text-blue-600 bg-blue-50 border-blue-200",
      module: "App Builder",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Basem Elfaky",
      userInitials: "BE",
      userInitialsColor: "bg-blue-500",
      detail: 'Moved "Services" from position 2 to position 1',
      ipAddress: "10.0.0.45",
    },
    {
      id: "2",
      timestamp: "2024-11-28  09:20:41",
      action: "Content Published",
      actionColor: "text-green-600 bg-green-50 border-green-200",
      module: "CMS",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Ameera Obaid",
      userInitials: "AO",
      userInitialsColor: "bg-amber-500",
      detail: 'Published "Community BBQ Night" event',
      ipAddress: "10.0.0.62",
    },
    {
      id: "3",
      timestamp: "2024-11-28  09:10:05",
      action: "User Created",
      actionColor: "text-blue-600 bg-blue-50 border-blue-200",
      module: "Users",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Basem Elfaky",
      userInitials: "BE",
      userInitialsColor: "bg-blue-500",
      detail: "Created user account for Dana Al Shehhi",
      ipAddress: "10.0.0.45",
    },
    {
      id: "4",
      timestamp: "2024-11-28  08:55:22",
      action: "SR Status Updated",
      actionColor: "text-blue-600 bg-blue-50 border-blue-200",
      module: "Service Requests",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Tariq Yusuf",
      userInitials: "TY",
      userInitialsColor: "bg-green-500",
      detail: "SR-2024-0891 status changed from Open to In-Progre...",
      ipAddress: "10.0.0.78",
    },
    {
      id: "5",
      timestamp: "2024-11-27  16:40:18",
      action: "Notification Sent",
      actionColor: "text-blue-600 bg-blue-50 border-blue-200",
      module: "Notifications",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Rashed Al Blooshi",
      userInitials: "RA",
      userInitialsColor: "bg-red-500",
      detail: 'Push notification "Overdue Invoice Reminder" sent to ...',
      ipAddress: "10.0.0.51",
    },
    {
      id: "6",
      timestamp: "2024-11-27  15:22:09",
      action: "Widget Visibility Toggle",
      actionColor: "text-gray-600 bg-gray-50 border-gray-200",
      module: "Home Builder",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Ameera Obaid",
      userInitials: "AO",
      userInitialsColor: "bg-amber-500",
      detail: "Banner widget hidden on Home Screen",
      ipAddress: "10.0.0.62",
    },
    {
      id: "7",
      timestamp: "2024-11-27  14:08:33",
      action: "Invoice Generated",
      actionColor: "text-orange-500 bg-orange-50 border-orange-200",
      module: "Invoices",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Dana Al Shehhi",
      userInitials: "DA",
      userInitialsColor: "bg-teal-500",
      detail: "Invoice INV-2024-4521 generated for Ahmed Al Rashidi",
      ipAddress: "10.0.0.90",
    },
    {
      id: "8",
      timestamp: "2024-11-27  13:50:11",
      action: "Customer Deactivated",
      actionColor: "text-red-500 bg-red-50 border-red-200",
      module: "Master Data",
      moduleBadgeColor: "border-blue-200 bg-blue-50 text-blue-600",
      userName: "Basem Elfaky",
      userInitials: "BE",
      userInitialsColor: "bg-blue-500",
      detail: "Customer Priya Sharma deactivated",
      ipAddress: "10.0.0.45",
    },
  ];
}
