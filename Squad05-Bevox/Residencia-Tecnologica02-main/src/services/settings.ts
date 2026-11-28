import { z } from "zod";
import { getPreferenceOwner } from "@/lib/preference-owner";
import { interfacePreferencesSchema, themePreferenceSchema, type InterfacePreferences } from "@/schemas/preferences";

export const SETTINGS_CHANGED = "bevox:settings-changed";
export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  global: { language: "pt-BR", dateFormat: "DD/MM/AAAA", timeZone: "America/Sao_Paulo", automaticPagination: false, keepFiltersAfterRefresh: true, showRowSummary: true, tableView: "standard" },
  user: { language: "inherit", dateFormat: "inherit", theme: "light", showVisualAlerts: true, playNotificationSounds: false },
};

export function settingsUserKey() {
  return getPreferenceOwner();
}

export function readSettings<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  return raw === null ? structuredClone(fallback) : schema.parse(JSON.parse(raw));
}

export function writeSettings<T>(key: string, schema: z.ZodType<T>, value: T): T {
  const parsed = schema.parse(value);
  window.localStorage.setItem(key, JSON.stringify(parsed));
  window.dispatchEvent(new Event(SETTINGS_CHANGED));
  return parsed;
}

export function readInterfacePreferences(): InterfacePreferences {
  const defaults = DEFAULT_INTERFACE_PREFERENCES;
  const user = readSettings(`bevox.settings.interface.user.${settingsUserKey()}`, interfacePreferencesSchema.shape.user, defaults.user);
  const legacyTheme = themePreferenceSchema.safeParse(window.localStorage.getItem("bevox.theme"));
  if (legacyTheme.success) user.theme = legacyTheme.data;
  return {
    global: readSettings("bevox.settings.interface.global", interfacePreferencesSchema.shape.global, defaults.global),
    user,
  };
}

export function saveInterfacePreferences(value: InterfacePreferences) {
  const parsed = interfacePreferencesSchema.parse(value);
  // Commit all keys together; quota errors must not leave half of the preferences saved.
  const entries = [
    ["bevox.settings.interface.global", JSON.stringify(parsed.global)],
    [`bevox.settings.interface.user.${settingsUserKey()}`, JSON.stringify(parsed.user)],
    ["bevox.theme", parsed.user.theme],
  ];
  const previous = entries.map(([key]) => window.localStorage.getItem(key));
  try {
    entries.forEach(([key, data]) => window.localStorage.setItem(key, data));
  } catch (error) {
    entries.forEach(([key], index) => {
      try {
        const old = previous[index];
        if (old === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, old);
      } catch { /* Preserve the original write error. */ }
    });
    throw error;
  }
  window.dispatchEvent(new Event(SETTINGS_CHANGED));
  window.dispatchEvent(new StorageEvent("storage", { key: "bevox.theme" }));
}

/** Date-only values keep their calendar day; timestamps use the configured time zone. */
export function formatPreferenceDate(value: string, preferences: InterfacePreferences, includeTime = false) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  const format = preferences.user.dateFormat === "inherit" ? preferences.global.dateFormat : preferences.user.dateFormat;
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: dateOnly ? "UTC" : preferences.global.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    ...(includeTime && !dateOnly ? { hour: "2-digit", minute: "2-digit" } as const : {}),
  });
  if (format === "DD/MM/AAAA") return formatter.format(date);
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}${includeTime && !dateOnly ? ` ${part("hour")}:${part("minute")}` : ""}`;
}

export async function playSettingsNotificationSound() {
  const context = new AudioContext();
  try {
    await context.resume();
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.connect(gain); gain.connect(context.destination);
    tone.frequency.value = 660;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    tone.start(); tone.stop(context.currentTime + 0.2);
    await new Promise<void>((resolve) => { tone.onended = () => resolve(); });
  } finally { await context.close(); }
}
