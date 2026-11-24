import { describe, expect, it } from "vitest";
import { pageAfterDelete } from "./useContentDelete";

describe("pageAfterDelete", () => {
  it("goes back a page when the last item of a later page is deleted", () => {
    expect(pageAfterDelete(3, 1)).toBe(2);
  });

  it("stays while the page still has items, and never goes before the first", () => {
    expect(pageAfterDelete(3, 2)).toBe(3);
    expect(pageAfterDelete(1, 1)).toBe(1);
  });
});
