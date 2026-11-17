import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Storage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

/** A window whose storage works, or throws like a blocked one. */
function stubWindow(storage: Storage) {
  const events = new EventTarget();
  vi.stubGlobal("window", {
    localStorage: storage,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  });
}

function workingStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

const blocked = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

// The module remembers a storage refusal, so each test loads it afresh.
async function load() {
  return import("./sideMenuExpanded");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseExpandedKeys", () => {
  it("reads the stored keys", async () => {
    const { parseExpandedKeys } = await load();
    expect(parseExpandedKeys('["masterData","operations"]')).toEqual(
      new Set(["masterData", "operations"]),
    );
  });

  it.each(["", "not json", "{}", '"masterData"', "null", "[1, null]"])(
    "treats %j as no open groups",
    async (value) => {
      const { parseExpandedKeys } = await load();
      expect(parseExpandedKeys(value)).toEqual(new Set());
    },
  );

  it("keeps only the string keys of a mixed array", async () => {
    const { parseExpandedKeys } = await load();
    expect(parseExpandedKeys('["operations", 2, {}]')).toEqual(
      new Set(["operations"]),
    );
  });
});

describe("the stored groups", () => {
  it("are saved and read back, and notify this tab", async () => {
    stubWindow(workingStorage());
    const store = await load();
    const onChange = vi.fn();
    const unsubscribe = store.subscribeToExpanded(onChange);

    store.writeExpandedKeys(new Set(["masterData"]));

    expect(store.parseExpandedKeys(store.readExpandedSnapshot())).toEqual(
      new Set(["masterData"]),
    );
    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.writeExpandedKeys(new Set());
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("read as none when storage is blocked, and still open in memory", async () => {
    stubWindow({ getItem: blocked, setItem: blocked });
    const store = await load();

    expect(store.readExpandedSnapshot()).toBe("");

    store.writeExpandedKeys(new Set(["operations"]));
    expect(store.parseExpandedKeys(store.readExpandedSnapshot())).toEqual(
      new Set(["operations"]),
    );
  });

  it("stay in memory when storage reads but refuses to save", async () => {
    stubWindow({ ...workingStorage(), setItem: blocked });
    const store = await load();

    store.writeExpandedKeys(new Set(["notifications"]));
    expect(store.parseExpandedKeys(store.readExpandedSnapshot())).toEqual(
      new Set(["notifications"]),
    );
  });

  it("are the same string while nothing changes", async () => {
    stubWindow(workingStorage({ "sideMenu:expanded": '["masterData"]' }));
    const store = await load();

    expect(store.readExpandedSnapshot()).toBe(store.readExpandedSnapshot());
    expect(store.readExpandedServerSnapshot()).toBe("");
  });
});
