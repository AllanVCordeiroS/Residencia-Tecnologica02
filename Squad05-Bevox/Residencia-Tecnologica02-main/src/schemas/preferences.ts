import * as z from "zod";

export const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

export const tableViewPreferenceSchema = z.enum(["compact", "standard"]);
export const languagePreferenceSchema = z.literal("pt-BR");
export const dateFormatPreferenceSchema = z.enum(["DD/MM/AAAA", "AAAA-MM-DD"]);
export const timeZonePreferenceSchema = z.enum(["America/Sao_Paulo", "America/Manaus", "America/Rio_Branco", "America/Noronha", "UTC"]);

export const globalInterfacePreferencesSchema = z.object({
  language: languagePreferenceSchema,
  dateFormat: dateFormatPreferenceSchema,
  timeZone: timeZonePreferenceSchema,
  automaticPagination: z.boolean(),
  keepFiltersAfterRefresh: z.boolean(),
  showRowSummary: z.boolean(),
  tableView: tableViewPreferenceSchema,
});

export const userInterfacePreferencesSchema = z.object({
  language: z.union([languagePreferenceSchema, z.literal("inherit")]),
  dateFormat: z.union([dateFormatPreferenceSchema, z.literal("inherit")]),
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
