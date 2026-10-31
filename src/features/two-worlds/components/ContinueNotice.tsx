"use client";

import { STORAGE_KEYS } from "../storage/storage";
import { useStoredItem } from "./useStoredItem";

/** Tells a returning player that /play resumes where they left off. Server render shows nothing. */
export function ContinueNotice() {
  const saved = useStoredItem(STORAGE_KEYS.normal);
  if (saved === null) return null;
  return <p>V tomto prohlížeči máš uložený průběh. Případ pokračuje tam, kde jsi skončil/a.</p>;
}
