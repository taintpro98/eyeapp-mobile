import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  PieChart,
  BarChart3,
  Sparkles,
  Settings,
  HelpCircle,
  Lock,
} from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

export default function MoreScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const tiles = [
    {
      icon: Star,
      label: "Watchlist",
      sub: "12 tickers tracked",
      onPress: () => router.push("/(more)/watchlist"),
    },
    {
      icon: PieChart,
      label: "Portfolio",
      sub: "Allocation & holdings",
      onPress: () => router.push("/(more)/portfolio"),
    },
    {
      icon: BarChart3,
      label: "Analytics",
      sub: "Performance & risk",
      onPress: () => router.push("/(more)/analytics"),
    },
    {
      icon: Sparkles,
      label: "AI Analysis",
      sub: "Premium",
      premium: true,
      onPress: () => router.push("/(more)/ai-analysis"),
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            styles.title,
            { color: c.textPrimary, fontFamily: typography.familyBold },
          ]}
        >
          More
        </Text>

        {/* 2x2 tile grid */}
        <View style={styles.tileGrid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              onPress={tile.onPress}
              style={styles.tileWrapper}
            >
              <View
                style={[
                  styles.tile,
                  { backgroundColor: c.card, borderColor: c.cardBorder },
                ]}
              >
                <View style={styles.tileIcon}>
                  <tile.icon size={18} color={c.brand} />
                </View>
                <Text
                  style={[
                    styles.tileLabel,
                    {
                      color: c.textPrimary,
                      fontFamily: typography.familySemiBold,
                    },
                  ]}
                >
                  {tile.label}
                </Text>
                <View style={styles.tileSubRow}>
                  {tile.premium && (
                    <Lock
                      size={10}
                      color={c.textFaint}
                      style={{ marginRight: 3 }}
                    />
                  )}
                  <Text style={[styles.tileSub, { color: c.textMuted }]}>
                    {tile.sub}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: c.divider }]} />

        {/* Settings & Help */}
        <Pressable style={styles.menuRow}>
          <Settings size={19} color={c.textMuted} />
          <Text
            style={[
              styles.menuText,
              { color: c.textPrimary, fontFamily: typography.familyMedium },
            ]}
          >
            Settings
          </Text>
        </Pressable>
        <Pressable style={styles.menuRow}>
          <HelpCircle size={19} color={c.textMuted} />
          <Text
            style={[
              styles.menuText,
              { color: c.textPrimary, fontFamily: typography.familyMedium },
            ]}
          >
            Help & support
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 18 },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tileWrapper: {
    width: "47%",
    flexGrow: 1,
  },
  tile: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(139,95,191,.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileLabel: { fontSize: 14, fontWeight: "600" },
  tileSubRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  tileSub: { fontSize: 11 },
  divider: { height: 1, marginVertical: 20 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuText: { fontSize: 14, fontWeight: "500" },
});
