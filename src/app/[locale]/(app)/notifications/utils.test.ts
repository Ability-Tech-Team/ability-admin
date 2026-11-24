import { describe, expect, it } from "vitest";
import {
  formatPushCount,
  formatReach,
  formatSentAt,
  pushResultsUnknown,
  readPercent,
  sentNotificationText,
} from "./utils";

const texts = { enTitle: "Pool maintenance", arTitle: "صيانة المسبح", enBody: "Closed on Friday.", arBody: "مغلق يوم الجمعة." };

describe("sentNotificationText", () => {
  it("picks the page's language", () => {
    expect(sentNotificationText(texts, "en")).toEqual({ title: "Pool maintenance", body: "Closed on Friday." });
    expect(sentNotificationText(texts, "ar")).toEqual({ title: "صيانة المسبح", body: "مغلق يوم الجمعة." });
  });

  it("falls back to the other language when one is empty", () => {
    expect(sentNotificationText({ ...texts, arTitle: "" }, "ar").title).toBe("Pool maintenance");
  });
});

describe("readPercent", () => {
  it("rounds read out of recipients", () => {
    expect(readPercent(2, 6)).toBe(33);
    expect(readPercent(6, 6)).toBe(100);
  });

  it("is 0 with no recipients", () => {
    expect(readPercent(0, 0)).toBe(0);
  });
});

describe("formatReach", () => {
  it("follows the design's `sent · read (%)`", () => {
    expect(formatReach({ sentCount: 1200, readCount: 300 }, { sent: "sent", read: "read" })).toBe(
      "1,200 sent · 300 read (25%)",
    );
  });
});

const push = (delivered: number, failed: number, noDevice: number, unknown: number) => ({
  delivered,
  failed,
  noDevice,
  unknown,
});

describe("formatPushCount", () => {
  it("shows the counts when results were recorded", () => {
    const send = { sentCount: 6, push: push(3, 1, 2, 0) };
    expect(formatPushCount(send, "delivered")).toBe("3");
    expect(formatPushCount(send, "failed")).toBe("1");
  });

  it("shows — when no result was recorded, rather than 0", () => {
    const send = { sentCount: 6, push: push(0, 0, 0, 6) };
    expect(pushResultsUnknown(send)).toBe(true);
    expect(formatPushCount(send, "delivered")).toBe("—");
    expect(formatPushCount(send, "failed")).toBe("—");
  });

  it("shows the counts while only some are still unknown", () => {
    const send = { sentCount: 6, push: push(2, 0, 0, 4) };
    expect(pushResultsUnknown(send)).toBe(false);
    expect(formatPushCount(send, "delivered")).toBe("2");
  });
});

describe("formatSentAt", () => {
  it("shows the API's own clock time, in the page's language with Latin digits", () => {
    const en = formatSentAt("2026-11-23T16:51:53+02:00", "en");
    expect(en).toContain("Nov");
    expect(en).toContain("2026");
    expect(en).toContain("4:51");
    const ar = formatSentAt("2026-11-23T16:51:53+02:00", "ar");
    expect(ar).toContain("2026");
    expect(ar).toContain("4:51");
  });

  it("shows anything else as it came", () => {
    expect(formatSentAt("yesterday", "en")).toBe("yesterday");
  });
});
