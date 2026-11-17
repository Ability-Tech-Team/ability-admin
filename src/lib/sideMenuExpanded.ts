/**
 * Which side-menu groups are open, remembered in this browser only (a
 * per-viewer convenience, never shared or trusted). The menu is on every
 * page, so storage must never break it: storage can be blocked (reading or
 * writing then throws) or hold anything. A bad value reads as "nothing open",
 * and once storage refuses, the groups are remembered in memory for this tab.
 */
const EXPANDED_KEY = "sideMenu:expanded";
const EXPANDED_EVENT = "sideMenu:changed";

/** The open groups once storage has refused a read or write; null before. */
let memoryFallback: string | null = null;

/** For `useSyncExternalStore`: changes in this tab and in other tabs. */
export function subscribeToExpanded(onChange: () => void): () => void {
  window.addEventListener(EXPANDED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EXPANDED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The stored value, a string so `useSyncExternalStore` compares it by value. */
export function readExpandedSnapshot(): string {
  if (memoryFallback !== null) {
    return memoryFallback;
  }

  try {
    return window.localStorage.getItem(EXPANDED_KEY) ?? "";
  } catch {
    memoryFallback = "";
    return memoryFallback;
  }
}

/** The server renders every group closed. */
export function readExpandedServerSnapshot(): string {
  return "";
}

/** The open groups' keys; anything but a JSON array of strings is none. */
export function parseExpandedKeys(value: string): Set<string> {
  if (!value) {
    return new Set();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return new Set();
  }

  return Array.isArray(parsed)
    ? new Set(parsed.filter((key): key is string => typeof key === "string"))
    : new Set();
}

export function writeExpandedKeys(keys: ReadonlySet<string>): void {
  const value = JSON.stringify([...keys]);

  if (memoryFallback === null) {
    try {
      window.localStorage.setItem(EXPANDED_KEY, value);
    } catch {
      memoryFallback = value;
    }
  } else {
    memoryFallback = value;
  }

  window.dispatchEvent(new Event(EXPANDED_EVENT));
}
