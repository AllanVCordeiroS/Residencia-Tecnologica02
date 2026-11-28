"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_INTERFACE_PREFERENCES, readInterfacePreferences, SETTINGS_CHANGED } from "@/services/settings";

let cached = DEFAULT_INTERFACE_PREFERENCES;
let serialized = "";
function snapshot() {
  try {
    const value = readInterfacePreferences();
    const next = JSON.stringify(value);
    if (next !== serialized) { cached = value; serialized = next; }
    return cached;
  } catch { return DEFAULT_INTERFACE_PREFERENCES; }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(SETTINGS_CHANGED, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(SETTINGS_CHANGED, listener);
  };
}
export function useInterfacePreferences() {
  return useSyncExternalStore(subscribe, snapshot, () => DEFAULT_INTERFACE_PREFERENCES);
}
