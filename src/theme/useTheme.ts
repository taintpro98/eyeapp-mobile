import { useColorScheme } from "react-native";
import { colors, type ThemeColors } from "./tokens";
import { useThemeStore } from "@/store/themeStore";

export function useThemeColors(): ThemeColors {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  const resolved =
    preference === "system"
      ? (systemScheme ?? "light")
      : preference;

  return resolved === "dark" ? colors.dark : colors.light;
}

export function useResolvedTheme(): "light" | "dark" {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();
  if (preference === "system") return systemScheme ?? "light";
  return preference;
}
