import type { ReactNode } from "react";
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
  /** A count from the API (none yet); never a made-up number. */
  badge?: number;
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
      { key: "projects", href: "/master-data/projects", icon: ProjectsSubIcon, badge: 5 },
      { key: "units", href: "/master-data/units", icon: UnitsSubIcon, badge: 1710 },
      { key: "customers", href: "/master-data/customers", icon: CustomersSubIcon, badge: 1470 },
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
      { key: "serviceRequests", href: "/operations/service-requests", icon: ServiceReqSubIcon, badge: 47 },
      { key: "complaints", href: "/operations/complaints", icon: ComplaintsSubIcon, badge: 19 },
      { key: "invoicesPayments", href: "/operations/invoices-payments", icon: InvoicesSubIcon, badge: 23 },
      { key: "guestInvitations", href: "/operations/guest-invitations", icon: GuestInvSubIcon, badge: 4 },
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
