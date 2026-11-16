import { describe, expect, it } from "vitest";
import {
  includesCommunityAdminPlatform,
  parseSessionDetails,
} from "./sessionDetails";

// What Ability Portal stores: the portal backend's sign-in answer
// (2026-10-29), with made-up values.
const COOKIE = {
  session: {
    employee_id: "00000000-0000-4000-8000-000000000001",
    role_name: "Super Admin",
    role_id: "00000000-0000-4000-8000-000000000002",
    user_name: "superAdmin",
    employee_name: "Super Admin",
    department_id: null,
    company_project_id: 2,
    company_code: "MAIN",
    employee_type_id: 1,
    project_code: "MAIN",
    project_name: "Main Project",
    employee_type_name: "Master Account",
    safe_id: 1,
    safe_name: "Default Safe",
    platforms: ["crm", "community-admin"],
  },
  client: { code: "client", nameEn: "Client", nameAr: "العميل", branding: { nameEn: "CRM", nameAr: null, logoUrl: null } },
  platforms: [{ key: "community-admin", url: "http://localhost:3200/", apiUrl: "http://172.20.1.141:9998" }],
};

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

describe("parseSessionDetails", () => {
  it("reads the Portal-written cookie", () => {
    const details = parseSessionDetails(encode(COOKIE));

    expect(details).toEqual({
      userName: "superAdmin",
      fullName: "Super Admin",
      roleName: "Super Admin",
      platforms: ["crm", "community-admin"],
      apiUrl: "http://172.20.1.141:9998",
    });
    expect(includesCommunityAdminPlatform(details!)).toBe(true);
  });

  it("does not open the app for a sign-in without community-admin", () => {
    const details = parseSessionDetails(
      encode({ ...COOKIE, session: { ...COOKIE.session, platforms: ["crm"] } }),
    );
    expect(includesCommunityAdminPlatform(details!)).toBe(false);
  });

  it("never assumes access without the list", () => {
    const details = parseSessionDetails(
      encode({ session: { employee_id: 7, user_name: "cashier" } }),
    );

    expect(details).toEqual({
      userName: "cashier",
      fullName: null,
      roleName: null,
      platforms: null,
      apiUrl: null,
    });
    expect(includesCommunityAdminPlatform(details!)).toBe(false);
  });

  it("has no API address when the sign-in lists none for this app", () => {
    const details = parseSessionDetails(
      encode({ ...COOKIE, platforms: [{ key: "crm", apiUrl: "https://api.example.com/crm" }] }),
    );
    expect(details?.apiUrl).toBeNull();
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["not base64url", "not a cookie!"],
    ["not JSON", Buffer.from("{oops", "utf8").toString("base64url")],
    ["without a session", encode({ client: COOKIE.client })],
    ["with a wrong type", encode({ session: { ...COOKIE.session, safe_id: "one" } })],
    ["too long", "a".repeat(5000)],
  ])("rejects a %s value", (_, raw) => {
    expect(parseSessionDetails(raw)).toBeNull();
  });
});
