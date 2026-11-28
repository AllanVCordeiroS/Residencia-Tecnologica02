"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { readInterfacePreferences, settingsUserKey } from "@/services/settings";

/** Only compatible table filters are retained, in this tab and for this local session owner. */
export function useSettingsFilters<T>(name: string, schema: z.ZodType<T>, defaults: T, enabled: boolean) {
  const [filters, setFilters] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const key = `bevox.settings.filters.${name}.${settingsUserKey()}`;
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      try {
        const keep = readInterfacePreferences().global.keepFiltersAfterRefresh;
        const raw = window.sessionStorage.getItem(key);
        const parsed = keep && raw ? schema.safeParse(JSON.parse(raw)) : null;
        if (active && parsed?.success) setFilters(parsed.data);
        if (!keep) window.sessionStorage.removeItem(key);
      } catch { /* Filter retention must not block the table. */ }
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [key, schema]);
  useEffect(() => {
    if (!loaded) return;
    try {
      if (enabled) window.sessionStorage.setItem(key, JSON.stringify(filters));
      else window.sessionStorage.removeItem(key);
    } catch { /* Browsers may deny optional filter persistence. */ }
  }, [enabled, filters, key, loaded]);
  return [filters, setFilters] as const;
}
