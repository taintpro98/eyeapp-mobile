import { Tabs } from "expo-router";
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
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signals"
        options={{
          title: "Signals",
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="positions"
        options={{
          title: "Positions",
          tabBarIcon: ({ color, size }) => (
            <Target size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
