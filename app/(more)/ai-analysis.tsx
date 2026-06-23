import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Lock, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

export default function AiAnalysisScreen() {
  const { t } = useTranslation();
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
          {t("nav.aiInsights")}
        </Text>
      </View>
      <View style={styles.centered}>
        <View style={styles.lockCircle}>
          <Lock size={32} color="#6F2C91" />
        </View>
        <Sparkles size={24} color={c.brand} style={{ marginTop: 12 }} />
        <Text
          style={[
            styles.lockedTitle,
            { color: c.textPrimary, fontFamily: typography.familySemiBold },
          ]}
        >
          {t("aiAnalysis.lockedTitle")}
        </Text>
        <Text style={[styles.lockedSub, { color: c.textMuted }]}>
          {t("aiAnalysis.lockedDesc")}
        </Text>
        <Pressable style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>{t("aiAnalysis.upgradeBtn")}</Text>
        </Pressable>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(111,44,145,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  lockedSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  upgradeButton: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 11,
    backgroundColor: "#6F2C91",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  upgradeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
