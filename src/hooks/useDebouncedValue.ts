"use client";

import { useEffect, useState } from "react";

/** `value`, once it has stopped changing for `delayMs`: search boxes call the API per pause, not per key. */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
