import { describe, expect, it } from "vitest";
import { formatBadge, toSideMenuCounts } from "./sideMenuCounts";
import { menuItems } from "./sideMenuItems";

describe("toSideMenuCounts", () => {
  it("takes each badge's count from the dashboard metrics", () => {
    expect(
      toSideMenuCounts({
        totalProjects: 3,
        totalUnits: 1710,
        activeCustomers: 1470,
        totalOwners: 684,
        totalTenants: 786,
        totalGuests: 236,
        avgOccupancy: 86,
        openServiceRequests: 47,
        openComplaints: 19,
        totalInvoicesValue: 0,
        totalCollectedValue: 0,
      }),
    ).toEqual({ projects: 3, units: 1710, customers: 1470, serviceRequests: 47, complaints: 19 });
  });
});

describe("formatBadge", () => {
  it("shows nothing for a missing or zero count", () => {
    expect(formatBadge(undefined)).toBeNull();
    expect(formatBadge(0)).toBeNull();
  });

  it("groups thousands, then shortens counts past 9,999", () => {
    expect(formatBadge(47)).toBe("47");
    expect(formatBadge(1710)).toBe("1,710");
    expect(formatBadge(20040)).toBe("20K");
    expect(formatBadge(42523)).toBe("42.5K");
    expect(formatBadge(1_250_000)).toBe("1.3M");
  });
});

describe("menuItems", () => {
  it("has no hardcoded badge numbers", () => {
    const badges = menuItems.flatMap((item) => item.children ?? []).map((child) => child.badge);
    expect(badges.every((badge) => badge === undefined || typeof badge === "string")).toBe(true);
  });
});
