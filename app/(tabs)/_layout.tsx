import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  BarChart3,
  Zap,
  Target,
  MoreHorizontal,
} from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

export default function TabLayout() {
  const { t } = useTranslation();
  const c = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBarBg,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 9,
        },
        tabBarActiveTintColor: c.brand,
        tabBarInactiveTintColor: c.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: typography.tabLabel,
          fontFamily: typography.familyMedium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: t("nav.market"),
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signals"
        options={{
          title: t("nav.signals"),
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="positions"
        options={{
          title: t("nav.positions"),
          tabBarIcon: ({ color, size }) => (
            <Target size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t("nav.more"),
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
