import { describe, expect, it } from "vitest";
import { describeServices, formatMonth, formatPercent, isValidPeriod } from "./utils";

describe("isValidPeriod", () => {
  it("accepts open-ended and ordered periods", () => {
    expect(isValidPeriod({ startDate: "", endDate: "" })).toBe(true);
    expect(isValidPeriod({ startDate: "2026-11-01", endDate: "" })).toBe(true);
    expect(isValidPeriod({ startDate: "", endDate: "2026-11-01" })).toBe(true);
    expect(isValidPeriod({ startDate: "2026-11-01", endDate: "2026-11-01" })).toBe(true);
  });

  it("rejects a period that ends before it starts", () => {
    expect(isValidPeriod({ startDate: "2026-11-02", endDate: "2026-11-01" })).toBe(false);
  });
});

describe("formatPercent", () => {
  it("keeps up to two decimals", () => {
    expect(formatPercent(86.667)).toBe("86.67%");
    expect(formatPercent(90)).toBe("90%");
  });
});

describe("formatMonth", () => {
  it("shows the month in the page's language, with the year only when asked", () => {
    expect(formatMonth("2026-11", "en", false)).toBe("Nov");
    expect(formatMonth("2026-01", "en", true)).toBe("Jan 26");
  });
});

describe("describeServices", () => {
  it("joins the services and shows quantities above one", () => {
    expect(
      describeServices(
        [
          { name: "AC repair", quantity: 1 },
          { name: null, quantity: 2 },
        ],
        "Unnamed service",
      ),
    ).toBe("AC repair, Unnamed service ×2");
  });
});
