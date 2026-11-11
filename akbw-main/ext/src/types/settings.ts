export type DarkModePreference = "system" | "light" | "dark";

export interface AppSettings {
  backendUrl: string;
  token: string;
  language: string;
  clearAfterImport: boolean;
  rememberSelections: boolean;
  darkMode: DarkModePreference;
}
