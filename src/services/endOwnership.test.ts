import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OWNERSHIP_OWNER,
  OWNERSHIP_RENTER,
  buildEndOwnershipBody,
  cairoToday,
  canEndAssignment,
  endOwnership,
} from "./unitAssignments";

const assignment = {
  customer: { id: 11, name: "Owner" },
  unit: { id: 22, unitNumber: "A-1" },
  project: { id: 3, name: "Marina" },
};

describe("canEndAssignment", () => {
  it("allows only an owner's open assignment", () => {
    expect(canEndAssignment({ active: true, ownership: { id: OWNERSHIP_OWNER, name: "Owner" } })).toBe(true);
    expect(canEndAssignment({ active: false, ownership: { id: OWNERSHIP_OWNER, name: "Owner" } })).toBe(false);
    expect(canEndAssignment({ active: true, ownership: { id: OWNERSHIP_RENTER, name: "Tenant" } })).toBe(false);
  });
});

describe("cairoToday", () => {
  it("uses Cairo's date, not the browser's", () => {
    // 23:30 UTC on 21 Nov is already 22 Nov in Cairo (UTC+2).
    expect(cairoToday(new Date("2026-11-21T23:30:00Z"))).toBe("2026-11-22");
    expect(cairoToday(new Date("2026-11-22T10:00:00Z"))).toBe("2026-11-22");
  });
});

describe("endOwnership", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("builds the EndOwnershipDto body", () => {
    expect(buildEndOwnershipBody(assignment, "2026-11-22")).toEqual({
      customer_id: 11,
      unit_id: 22,
      project_id: 3,
      end_date: "2026-11-22",
    });
  });

  it("posts it and resolves with how many relatives lost the unit", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          result: { message: "Ownership ended successfully", ended_relatives: 2, message_code: "OWNERSHIP_ENDED_SUCCESSFULLY" },
          success: true,
          statusCode: 201,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchImpl);

    await expect(endOwnership("/b", assignment, "2026-11-22", "en")).resolves.toBe(2);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/b/customers/end-ownership");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ customer_id: 11, unit_id: 22, project_id: 3, end_date: "2026-11-22" });
  });

  it("passes the API's refusal on", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ result: { message: "Not found", message_code: "OWNERSHIP_NOT_FOUND" }, success: false, statusCode: 404 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    await expect(endOwnership("/b", assignment, "2026-11-22", "en")).rejects.toMatchObject({
      status: 404,
      code: "OWNERSHIP_NOT_FOUND",
    });
  });
});
