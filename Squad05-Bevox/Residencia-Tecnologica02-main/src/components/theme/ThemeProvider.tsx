"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DEFAULT_THEME_PREFERENCE,
  themePreferenceSchema,
  type ThemePreference,
} from "@/schemas/preferences";

const THEME_STORAGE_KEY = "bevox.theme";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeListeners = new Set<() => void>();
let currentThemePreference = DEFAULT_THEME_PREFERENCE;
let preferMemoryPreference = false;
let lastInvalidPreference: string | null = null;

function getThemeSnapshot(): ThemePreference {
  if (typeof window === "undefined" || preferMemoryPreference) {
    return currentThemePreference;
  }

  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedPreference === null) return currentThemePreference;

    const parsedPreference = themePreferenceSchema.safeParse(storedPreference);
    if (parsedPreference.success) {
      currentThemePreference = parsedPreference.data;
      lastInvalidPreference = null;
      return parsedPreference.data;
    }

    if (lastInvalidPreference !== storedPreference) {
      console.warn(
        "Preferência de tema inválida; usando o tema claro.",
        parsedPreference.error,
      );
      lastInvalidPreference = storedPreference;
    }
    return DEFAULT_THEME_PREFERENCE;
  } catch (error) {
    console.error("Não foi possível ler a preferência de tema:", error);
    return currentThemePreference;
  }
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
  preferMemoryPreference = false;
  notifyThemeListeners();
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  if (themeListeners.size === 1) {
    window.addEventListener("storage", handleStorageChange);
  }

  return () => {
    themeListeners.delete(listener);
    if (themeListeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function subscribeToSystemTheme(listener: () => void) {
  const colorScheme = window.matchMedia(COLOR_SCHEME_QUERY);
  colorScheme.addEventListener("change", listener);
  return () => colorScheme.removeEventListener("change", listener);
}

function getSystemThemeSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

function getServerSystemThemeSnapshot() {
  return false;
}

function updateThemePreference(theme: ThemePreference) {
  const validatedTheme = themePreferenceSchema.parse(theme);
  currentThemePreference = validatedTheme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, validatedTheme);
    preferMemoryPreference = false;
  } catch (error) {
    preferMemoryPreference = true;
    console.error("Não foi possível salvar a preferência de tema:", error);
  }

  notifyThemeListeners();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => DEFAULT_THEME_PREFERENCE,
  );
  const prefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerSystemThemeSnapshot,
  );
  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: updateThemePreference,
    }),
    [theme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  }
  return context;
}
