import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, BarChart3 } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

export default function AnalyticsScreen() {
  const c = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text
          style={[
            styles.title,
            { color: c.textPrimary, fontFamily: typography.familyBold },
          ]}
        >
          Analytics
        </Text>
      </View>
      <View style={styles.centered}>
        <BarChart3 size={48} color={c.textFaint} />
        <Text style={[styles.placeholder, { color: c.textMuted }]}>
          Performance & risk analytics
        </Text>
        <Text style={[styles.sub, { color: c.textFaint }]}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: -0.2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  placeholder: { fontSize: 15, fontWeight: "500", marginTop: 8 },
  sub: { fontSize: 13 },
});
