/** Up to two initials for an owner's avatar: the first letters of the first two words. */
export function ownerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
    .join("");
}

const OWNER_COLORS = ["bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-violet-500"] as const;

/** The same colour for a customer every time. */
export function ownerColor(customerId: number): string {
  return OWNER_COLORS[Math.abs(customerId) % OWNER_COLORS.length];
}

/** One of the two ticked statuses filters by it; none or both list every unit. */
export function activeFromStatusFilter(selected: ReadonlySet<string>): boolean | undefined {
  const active = selected.has("active");
  const inactive = selected.has("inactive");
  return active === inactive ? undefined : active;
}
