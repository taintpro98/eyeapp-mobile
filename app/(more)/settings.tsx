import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Sun, Moon, Monitor, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { useThemeStore, type ThemePreference } from "@/store/themeStore";
import { setLanguage } from "@/i18n";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { logout as apiLogout } from "@/api/auth";
import { useState } from "react";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const c = useThemeColors();
  const router = useRouter();
  const { preference, setPreference } = useThemeStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [currentLang, setCurrentLang] = useState(i18n.language as "en" | "vi");

  async function handleLanguage(lang: "en" | "vi") {
    await setLanguage(lang);
    setCurrentLang(lang);
  }

  async function handleTheme(pref: ThemePreference) {
    await setPreference(pref);
  }

  async function handleLogout() {
    try { await apiLogout(refreshToken ?? undefined); } catch {}
    await clearAuth();
  }

  const themeOptions: { value: ThemePreference; labelKey: string; Icon: typeof Sun }[] = [
    { value: "light", labelKey: "theme.light", Icon: Sun },
    { value: "dark", labelKey: "theme.dark", Icon: Moon },
    { value: "system", labelKey: "theme.system", Icon: Monitor },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.title, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
          {t("settings.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Appearance */}
        <SectionHeader title={t("settings.appearance")} subtitle={t("settings.appearanceSubtitle")} c={c} />
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          {themeOptions.map((opt, i) => {
            const active = preference === opt.value;
            return (
              <View key={opt.value}>
                {i > 0 && <View style={[styles.rowDivider, { backgroundColor: c.divider }]} />}
                <Pressable style={styles.row} onPress={() => handleTheme(opt.value)}>
                  <opt.Icon size={17} color={active ? c.brand : c.textMuted} />
                  <Text style={[styles.rowLabel, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
                    {t(opt.labelKey)}
                  </Text>
                  <View style={{ flex: 1 }} />
                  {active && <Check size={16} color={c.brand} />}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Language */}
        <SectionHeader title={t("settings.language")} subtitle={t("settings.languageSubtitle")} c={c} />
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          {(["en", "vi"] as const).map((lang, i) => {
            const active = currentLang === lang;
            return (
              <View key={lang}>
                {i > 0 && <View style={[styles.rowDivider, { backgroundColor: c.divider }]} />}
                <Pressable style={styles.row} onPress={() => handleLanguage(lang)}>
                  <Text style={[styles.flag]}>{lang === "en" ? "🇬🇧" : "🇻🇳"}</Text>
                  <Text style={[styles.rowLabel, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
                    {t(`language.${lang}`)}
                  </Text>
                  <View style={{ flex: 1 }} />
                  {active && <Check size={16} color={c.brand} />}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Profile */}
        <SectionHeader title={t("settings.profile")} subtitle={t("settings.profileSubtitle")} c={c} />
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <ProfileRow label={t("settings.displayName")} value="—" c={c} />
          <View style={[styles.rowDivider, { backgroundColor: c.divider }]} />
          <ProfileRow label={t("settings.email")} value="—" c={c} />
        </View>

        {/* Sign out */}
        <Pressable
          style={[styles.signOutBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}
          onPress={handleLogout}
        >
          <Text style={[styles.signOutText, { color: c.negative, fontFamily: typography.familySemiBold }]}>
            {t("settings.signOut")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  subtitle,
  c,
}: {
  title: string;
  subtitle: string;
  c: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
        {title}
      </Text>
      <Text style={[styles.sectionSub, { color: c.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

function ProfileRow({ label, value, c }: { label: string; value: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={styles.profileRow}>
      <Text style={[styles.profileLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.profileValue, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700" },
  scroll: { padding: 18, gap: 8 },
  sectionHeader: { marginTop: 12, marginBottom: 6 },
  sectionTitle: { fontSize: 13, fontWeight: "600" },
  sectionSub: { fontSize: 11, marginTop: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: { height: 1, marginLeft: 16 },
  rowLabel: { fontSize: 14 },
  flag: { fontSize: 18 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  profileLabel: { fontSize: 13 },
  profileValue: { fontSize: 13 },
  signOutBtn: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: { fontSize: 14 },
});
