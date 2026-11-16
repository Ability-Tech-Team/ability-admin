/* ------------------------------------------------------------------ */
/*  Parent menu icons (24×24, outline/stroke)                          */
/* ------------------------------------------------------------------ */

export type IconProps = { className?: string };

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function MasterDataIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v6c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3v-6" />
      <path d="M4.5 11.5v6c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3v-6" />
    </svg>
  );
}

export function OperationsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2m-7.78-3.22 1.42-1.42m12.72-12.72 1.42-1.42M1 12h2m18 0h2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42" />
    </svg>
  );
}

export function CmsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.25" y="3.75" width="19.5" height="16.5" rx="2" />
      <path d="M2.25 7.5h19.5" />
      <path d="M9.75 7.5v12.75" />
    </svg>
  );
}

export function NotificationsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

export function EventsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-item icons (emoji)                                             */
/* ------------------------------------------------------------------ */

/**
 * Decorative: the translated label next to it names the item, so screen
 * readers skip the emoji (`label` only documents which one it is).
 */
function EmojiIcon({ className, emoji }: IconProps & { emoji: string; label: string }) {
  return (
    <span className={`${className} flex items-center justify-center leading-none`} aria-hidden="true">
      {emoji}
    </span>
  );
}

export function ProjectsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🏗️" label="projects" />;
}

export function UnitsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🏢" label="units" />;
}

export function CustomersSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🧑" label="customers" />;
}

export function UnitAssignmentSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🔗" label="unit assignment" />;
}

export function FamilyMembersSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="👨‍👩‍👧" label="family members" />;
}

export function RentalSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🏠" label="rental management" />;
}

export function ServiceReqSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🛠️" label="service requests" />;
}

export function ComplaintsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📣" label="complaints" />;
}

export function InvoicesSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📑" label="invoices" />;
}

export function GuestInvSubIcon({ className }: IconProps) {
  return (
    <span className={`${className} flex items-center justify-center leading-none text-[10px] font-bold text-white/80`} aria-label="guest invitations">
      QR
    </span>
  );
}

export function AppBuilderSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📱" label="app builder" />;
}

export function ContentEditorSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="✏️" label="content editor" />;
}

export function EventsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🎉" label="events" />;
}

export function AboutUsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="ℹ️" label="about us" />;
}

export function PhoneDirSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📞" label="phone directory" />;
}

export function GuidelinesSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📋" label="guidelines" />;
}

export function NewsShopsSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📰" label="news and shops" />;
}

export function UserSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="👤" label="users" />;
}

export function RolesSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="🛡️" label="roles" />;
}

export function AuditLogSubIcon({ className }: IconProps) {
  return <EmojiIcon className={className} emoji="📝" label="audit log" />;
}

/* ------------------------------------------------------------------ */
/*  Utility icons                                                      */
/* ------------------------------------------------------------------ */

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
        open ? "rotate-90" : "ltr:rotate-0 rtl:rotate-180"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function CollapseIcon({ collapsed, size }: { collapsed: boolean; size?: "small" }) {
  return (
    <svg
      className={`${size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0 transition-transform duration-200 ${
        collapsed ? "ltr:rotate-180 rtl:rotate-0" : "ltr:rotate-0 rtl:rotate-180"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m13 5-7 7 7 7" />
      <path d="m20 5-7 7 7 7" />
    </svg>
  );
}
