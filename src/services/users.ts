export type UserRole =
  | "super-admin"
  | "fm-manager"
  | "cms-editor"
  | "operations-staff"
  | "finance-manager";

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  initialsColor: string;
  role: UserRole;
  projectAccess: string;
  lastLogin: string;
  active: boolean;
};

// TODO: replace with real API call
export async function fetchUsers(): Promise<User[]> {
  return [
    {
      id: "1",
      name: "Basem Elfaky",
      email: "basem.elfaky@ability.app",
      initials: "BE",
      initialsColor: "bg-blue-500",
      role: "super-admin",
      projectAccess: "All Projects",
      lastLogin: "2024-11-28  09:14",
      active: true,
    },
    {
      id: "2",
      name: "Rashed Al Blooshi",
      email: "rashed@ability.ae",
      initials: "RB",
      initialsColor: "bg-red-500",
      role: "fm-manager",
      projectAccess: "Marina Heights, Palm Residences",
      lastLogin: "2024-11-28  08:30",
      active: true,
    },
    {
      id: "3",
      name: "Ameera Obaid",
      email: "ameera@ability.ae",
      initials: "AO",
      initialsColor: "bg-green-500",
      role: "cms-editor",
      projectAccess: "Corniche Gardens",
      lastLogin: "2024-11-27  14:20",
      active: true,
    },
    {
      id: "4",
      name: "Tariq Yusuf",
      email: "tariq@ability.ae",
      initials: "TY",
      initialsColor: "bg-teal-500",
      role: "operations-staff",
      projectAccess: "Marina Heights",
      lastLogin: "2024-11-28  07:45",
      active: true,
    },
    {
      id: "5",
      name: "Dana Al Shehhi",
      email: "dana@ability.ae",
      initials: "DS",
      initialsColor: "bg-blue-500",
      role: "finance-manager",
      projectAccess: "All Projects",
      lastLogin: "2024-11-15  11:00",
      active: false,
    },
  ];
}
