import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "alumieye-theme";

type ThemeState = {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  setPreference: async (pref) => {
    await AsyncStorage.setItem(THEME_KEY, pref);
    set({ preference: pref });
  },
}));

export async function loadThemePreference(): Promise<ThemePreference> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  const pref = (stored as ThemePreference | null) ?? "system";
  useThemeStore.setState({ preference: pref });
  return pref;
}
