"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Raw localStorage value, read only on the client. The server render and hydration see null,
 * so there is no mismatch; other tabs' writes arrive through the storage event.
 */
export const useStoredItem = (key: string): string | null =>
  useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
