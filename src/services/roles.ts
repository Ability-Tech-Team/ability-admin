export type Permission = "view" | "create" | "edit" | "delete" | "approve";

export type ModulePermissions = {
  module: string;
  permissions: Record<Permission, boolean>;
};

export type Role = {
  id: string;
  name: string;
  userCount: number;
  modules: ModulePermissions[];
};

const allPermissions: Permission[] = ["view", "create", "edit", "delete", "approve"];

function mp(module: string, perms: Permission[]): ModulePermissions {
  const permissions = Object.fromEntries(allPermissions.map((p) => [p, perms.includes(p)])) as Record<Permission, boolean>;
  return { module, permissions };
}

// TODO: replace with real API call
export async function fetchRoles(): Promise<Role[]> {
  return [
    {
      id: "1",
      name: "Super Admin",
      userCount: 2,
      modules: [
        mp("Dashboard", ["view"]),
        mp("Projects", ["create", "edit", "approve"]),
        mp("Units", ["view", "create", "edit"]),
        mp("Customers", ["view", "edit", "delete"]),
        mp("Service Requests", ["edit"]),
        mp("Complaints", ["edit", "delete"]),
        mp("Invoices", ["view", "approve"]),
        mp("App Builder", ["view", "create", "edit", "approve"]),
        mp("Home Builder", ["view", "create", "edit", "approve"]),
      ],
    },
    {
      id: "2",
      name: "FM Manager",
      userCount: 5,
      modules: [
        mp("Dashboard", ["view"]),
        mp("Projects", ["view", "edit"]),
        mp("Units", ["view", "create", "edit"]),
        mp("Customers", ["view"]),
        mp("Service Requests", ["view", "create", "edit"]),
        mp("Complaints", ["view", "create", "edit"]),
        mp("Invoices", ["view"]),
        mp("App Builder", []),
        mp("Home Builder", []),
      ],
    },
    {
      id: "3",
      name: "CMS Editor",
      userCount: 3,
      modules: [
        mp("Dashboard", ["view"]),
        mp("Projects", []),
        mp("Units", []),
        mp("Customers", []),
        mp("Service Requests", []),
        mp("Complaints", []),
        mp("Invoices", []),
        mp("App Builder", ["view", "create", "edit"]),
        mp("Home Builder", ["view", "create", "edit"]),
      ],
    },
    {
      id: "4",
      name: "Operations Staff",
      userCount: 12,
      modules: [
        mp("Dashboard", ["view"]),
        mp("Projects", []),
        mp("Units", ["view"]),
        mp("Customers", ["view"]),
        mp("Service Requests", ["view", "create", "edit"]),
        mp("Complaints", ["view", "create"]),
        mp("Invoices", ["view"]),
        mp("App Builder", []),
        mp("Home Builder", []),
      ],
    },
    {
      id: "5",
      name: "Finance Manager",
      userCount: 2,
      modules: [
        mp("Dashboard", ["view"]),
        mp("Projects", []),
        mp("Units", []),
        mp("Customers", ["view"]),
        mp("Service Requests", []),
        mp("Complaints", []),
        mp("Invoices", ["view", "create", "edit", "approve"]),
        mp("App Builder", []),
        mp("Home Builder", []),
      ],
    },
  ];
}
