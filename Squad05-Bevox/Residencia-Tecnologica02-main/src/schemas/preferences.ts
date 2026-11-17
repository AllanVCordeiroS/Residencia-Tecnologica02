import * as z from "zod";

export const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

export const tableViewPreferenceSchema = z.enum(["compact", "standard"]);

export const globalInterfacePreferencesSchema = z.object({
  language: z.string().min(1),
  dateFormat: z.string().min(1),
  timeZone: z.string().min(1),
  automaticPagination: z.boolean(),
  keepFiltersAfterRefresh: z.boolean(),
  showRowSummary: z.boolean(),
  tableView: tableViewPreferenceSchema,
});

export const userInterfacePreferencesSchema = z.object({
  language: z.string().min(1),
  dateFormat: z.string().min(1),
  showVisualAlerts: z.boolean(),
  playNotificationSounds: z.boolean(),
  theme: themePreferenceSchema,
});

export const interfacePreferencesSchema = z.object({
  global: globalInterfacePreferencesSchema,
  user: userInterfacePreferencesSchema,
});

export type GlobalInterfacePreferences = z.infer<
  typeof globalInterfacePreferencesSchema
>;
export type UserInterfacePreferences = z.infer<
  typeof userInterfacePreferencesSchema
>;
export type InterfacePreferences = z.infer<typeof interfacePreferencesSchema>;

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";
