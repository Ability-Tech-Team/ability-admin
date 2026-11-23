import { describe, expect, it } from "vitest";
import { formatAmount, initials, statusLook } from "./utils";

describe("formatAmount", () => {
  it("shows plain numbers with up to two decimals", () => {
    expect(formatAmount(85000)).toBe("85,000");
    expect(formatAmount(1250.5)).toBe("1,250.5");
    expect(formatAmount(0.125)).toBe("0.13");
  });
});

describe("initials", () => {
  it("takes the first letters of the first two words", () => {
    expect(initials("ahmed al rashidi")).toBe("AA");
    expect(initials("  Fatima ")).toBe("F");
    expect(initials(null)).toBeNull();
    expect(initials("   ")).toBeNull();
  });
});

describe("statusLook", () => {
  it("colours collected green and unknown ids grey", () => {
    expect(statusLook(2).dot).toBe("bg-emerald-500");
    expect(statusLook(99).dot).toBe("bg-gray-400");
  });
});
