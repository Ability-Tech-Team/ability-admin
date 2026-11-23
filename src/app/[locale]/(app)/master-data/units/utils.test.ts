import { describe, expect, it } from "vitest";
import { activeFromStatusFilter, ownerColor } from "./utils";

describe("activeFromStatusFilter", () => {
  it("filters only when one of the two statuses is ticked", () => {
    expect(activeFromStatusFilter(new Set())).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active", "inactive"]))).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active"]))).toBe(true);
    expect(activeFromStatusFilter(new Set(["inactive"]))).toBe(false);
  });
});

describe("ownerColor", () => {
  it("gives a customer the same colour every time", () => {
    expect(ownerColor(9)).toBe(ownerColor(9));
    expect(ownerColor(9)).toMatch(/^bg-/);
  });
});
