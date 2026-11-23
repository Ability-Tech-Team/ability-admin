import type { ReactNode } from "react";
import type { SideMenuCountKey } from "./sideMenuCounts";
import {
  type IconProps,
  DashboardIcon,
  MasterDataIcon,
  ProjectsSubIcon,
  UnitsSubIcon,
  CustomersSubIcon,
  UnitAssignmentSubIcon,
  FamilyMembersSubIcon,
  RentalSubIcon,
  OperationsIcon,
  ServiceReqSubIcon,
  ComplaintsSubIcon,
  InvoicesSubIcon,
  GuestInvSubIcon,
  NotificationsIcon,
  EventsIcon,
  EventsSubIcon,
  AboutUsSubIcon,
  PhoneDirSubIcon,
  GuidelinesSubIcon,
  NewsShopsSubIcon,
  UsersIcon,
  UserSubIcon,
  RolesSubIcon,
  AuditLogSubIcon,
  SettingsIcon,
} from "@/src/components/icons/SideMenuIcons";

/**
 * The side menu's entries (src/components/SideMenu.tsx). Labels come from the
 * `SideMenu` catalog namespace by `key`. `href: "#"` marks a module that
 * isn't built yet: it shows, but doesn't link.
 */
export type SubItem = {
  key: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  /** Which API count the badge shows (`src/lib/sideMenuCounts.ts`); never a made-up number. */
  badge?: SideMenuCountKey;
};

export type MenuItem = {
  key: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  children?: SubItem[];
};

export const menuItems: MenuItem[] = [
  { key: "dashboard", href: "/", icon: DashboardIcon },
  {
    key: "masterData",
    href: "#",
    icon: MasterDataIcon,
    children: [
      { key: "projects", href: "/master-data/projects", icon: ProjectsSubIcon, badge: "projects" },
      { key: "units", href: "/master-data/units", icon: UnitsSubIcon, badge: "units" },
      { key: "customers", href: "/master-data/customers", icon: CustomersSubIcon, badge: "customers" },
      { key: "unitAssignment", href: "/master-data/unit-assignment", icon: UnitAssignmentSubIcon },
      { key: "familyMembers", href: "/master-data/family-members", icon: FamilyMembersSubIcon },
      { key: "rentalManagement", href: "/master-data/rental-management", icon: RentalSubIcon },
    ],
  },
  {
    key: "operations",
    href: "#",
    icon: OperationsIcon,
    children: [
      { key: "serviceRequests", href: "/operations/service-requests", icon: ServiceReqSubIcon, badge: "serviceRequests" },
      { key: "complaints", href: "/operations/complaints", icon: ComplaintsSubIcon, badge: "complaints" },
      // No count for these in the API yet.
      { key: "invoicesPayments", href: "/operations/invoices-payments", icon: InvoicesSubIcon },
      { key: "guestInvitations", href: "/operations/guest-invitations", icon: GuestInvSubIcon },
    ],
  },
  { key: "notifications", href: "/notifications", icon: NotificationsIcon },
  {
    key: "eventsContent",
    href: "#",
    icon: EventsIcon,
    children: [
      { key: "events", href: "/events-content/events", icon: EventsSubIcon },
      { key: "newsShops", href: "/events-content/news-shops", icon: NewsShopsSubIcon },
      { key: "phoneDirectory", href: "/events-content/phone-directory", icon: PhoneDirSubIcon },
      { key: "aboutUs", href: "/events-content/about-us", icon: AboutUsSubIcon },
      { key: "guidelines", href: "/events-content/guidelines", icon: GuidelinesSubIcon },
    ],
  },
  {
    key: "usersPermissions",
    href: "#",
    icon: UsersIcon,
    children: [
      { key: "users", href: "/users-permissions/users", icon: UserSubIcon },
      { key: "rolesPermissions", href: "/users-permissions/roles-permissions", icon: RolesSubIcon },
      { key: "auditLog", href: "/audit-log", icon: AuditLogSubIcon },
    ],
  },
  { key: "settings", href: "/settings/app-configuration", icon: SettingsIcon },
];
