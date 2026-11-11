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
      { key: "projects", href: "#", icon: ProjectsSubIcon },
      { key: "units", href: "#", icon: UnitsSubIcon },
      { key: "customers", href: "#", icon: CustomersSubIcon },
      { key: "unitAssignment", href: "#", icon: UnitAssignmentSubIcon },
      { key: "familyMembers", href: "#", icon: FamilyMembersSubIcon },
      { key: "rentalManagement", href: "#", icon: RentalSubIcon },
    ],
  },
  {
    key: "operations",
    href: "#",
    icon: OperationsIcon,
    children: [
      { key: "serviceRequests", href: "#", icon: ServiceReqSubIcon },
      { key: "complaints", href: "#", icon: ComplaintsSubIcon },
      { key: "invoicesPayments", href: "#", icon: InvoicesSubIcon },
      { key: "guestInvitations", href: "#", icon: GuestInvSubIcon },
    ],
  },
  { key: "notifications", href: "#", icon: NotificationsIcon },
  {
    key: "eventsContent",
    href: "#",
    icon: EventsIcon,
    children: [
      { key: "events", href: "#", icon: EventsSubIcon },
      { key: "aboutUs", href: "#", icon: AboutUsSubIcon },
      { key: "phoneDirectory", href: "#", icon: PhoneDirSubIcon },
      { key: "guidelines", href: "#", icon: GuidelinesSubIcon },
      { key: "newsShops", href: "#", icon: NewsShopsSubIcon },
    ],
  },
  {
    key: "usersPermissions",
    href: "#",
    icon: UsersIcon,
    children: [
      { key: "users", href: "#", icon: UserSubIcon },
      { key: "rolesPermissions", href: "#", icon: RolesSubIcon },
      { key: "auditLog", href: "#", icon: AuditLogSubIcon },
    ],
  },
  { key: "settings", href: "#", icon: SettingsIcon },
];
