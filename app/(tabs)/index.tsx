import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, BarChart3, ArrowRight } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { AppHeader } from "@/components/AppHeader";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { useAuthStore } from "@/store/authStore";
import { useSignals } from "@/hooks/useSignals";

type KpiItem = {
  label: string;
  value: string;
  suffix?: string;
  change: string;
  positive?: boolean;
  neutral?: boolean;
  icon: "trend" | "bar";
};

const MOCK_KPIS: KpiItem[] = [
  { label: "VN-Index", value: "1,284.32", change: "+0.84% today", positive: true, icon: "trend" },
  { label: "VN30", value: "1,342.10", change: "+0.62% today", positive: true, icon: "trend" },
  { label: "HOSE Value", value: "18,420", suffix: " B", change: "Session turnover", neutral: true, icon: "bar" },
  { label: "Net Foreign", value: "+312.4", suffix: " B", change: "Buy – sell, today", positive: true, icon: "trend" },
];

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [marketId, setMarketId] = useState<1 | 2>(2);
  const { data: signalsData } = useSignals({ market_id: marketId });

  const displayName = user?.display_name?.split(" ")[0] ?? "User";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.title,
                { color: c.textPrimary, fontFamily: typography.familyBold },
              ]}
            >
              Welcome, {displayName}
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              Your markets at a glance
            </Text>
          </View>
          <SegmentedToggle
            options={[
              { label: "Stocks", value: 2 },
              { label: "Crypto", value: 1 },
            ]}
            selected={marketId}
            onSelect={(v) => setMarketId(v as 1 | 2)}
          />
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {MOCK_KPIS.map((kpi) => (
            <View
              key={kpi.label}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: c.card,
                  borderColor: c.cardBorder,
                  shadowColor: c.cardShadow,
                },
              ]}
            >
              <View style={styles.kpiHeader}>
                <Text style={[styles.kpiLabel, { color: c.textMuted }]}>
                  {kpi.label}
                </Text>
                <View style={styles.kpiIcon}>
                  {kpi.icon === "trend" ? (
                    <TrendingUp size={15} color={c.brand} />
                  ) : (
                    <BarChart3 size={15} color={c.brand} />
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.kpiValue,
                  {
                    color: kpi.positive && kpi.label === "Net Foreign"
                      ? c.positive
                      : c.textPrimary,
                    fontFamily: typography.familySemiBold,
                  },
                ]}
              >
                {kpi.value}
                {kpi.suffix && (
                  <Text style={{ fontSize: 13, color: c.textMuted }}>
                    {kpi.suffix}
                  </Text>
                )}
              </Text>
              <Text
                style={[
                  styles.kpiChange,
                  {
                    color: kpi.neutral
                      ? c.textMuted
                      : kpi.positive
                        ? c.positive
                        : c.negative,
                  },
                ]}
              >
                {kpi.change}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent signals */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.card,
              borderColor: c.cardBorder,
              shadowColor: c.cardShadow,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: c.textPrimary, fontFamily: typography.familySemiBold },
            ]}
          >
            Recent signals
          </Text>
          <Text style={[styles.cardSub, { color: c.textMuted }]}>
            Latest moves on your markets
          </Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {(signalsData?.pages?.[0]?.items ?? []).slice(0, 3).map((sig) => (
              <View
                key={sig.id}
                style={[
                  styles.signalRow,
                  { borderColor: c.cardBorder },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View>
                    <Text
                      style={[
                        styles.signalSymbol,
                        { color: c.textPrimary, fontFamily: typography.familySemiBold },
                      ]}
                    >
                      {sig.symbol}
                    </Text>
                    <Text style={[styles.signalMeta, { color: c.textMuted }]}>
                      {sig.side === "buy" ? "Buy" : "Sell"} · {sig.confidence > 0.7 ? "Strong" : "Moderate"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.signalTime, { color: c.textMuted }]}>
                  {timeAgo(sig.timestamp)}
                </Text>
              </View>
            ))}
          </View>
          <Pressable
            style={styles.viewAllRow}
            onPress={() => router.push("/(tabs)/signals")}
          >
            <Text style={[styles.viewAllText, { color: c.brand }]}>
              View all signals
            </Text>
            <ArrowRight size={15} color={c.brand} />
          </Pressable>
        </View>

        {/* Upgrade card */}
        <View
          style={[
            styles.upgradeCard,
            { borderColor: "rgba(111,44,145,.2)" },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: c.textPrimary, fontFamily: typography.familySemiBold },
            ]}
          >
            Unlock Premium
          </Text>
          <Text style={[styles.cardSub, { color: c.textMuted, marginBottom: 12 }]}>
            Advanced analytics, crypto markets and AI insights.
          </Text>
          <View style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade now</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingTop: 2, gap: 14 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.2 },
  subtitle: { fontSize: 12.5, marginTop: 3 },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  kpiCard: {
    width: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kpiLabel: { fontSize: 11.5, fontWeight: "500" },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(111,44,145,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiValue: { fontSize: 21, fontWeight: "600", marginTop: 6, letterSpacing: -0.2 },
  kpiChange: { fontSize: 12, fontWeight: "500", marginTop: 3 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSub: { fontSize: 12, marginTop: 2 },
  signalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 11,
    padding: 10,
    paddingHorizontal: 11,
  },
  signalSymbol: { fontSize: 14, fontWeight: "600" },
  signalMeta: { fontSize: 11.5, marginTop: 1 },
  signalTime: { fontSize: 11.5 },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  viewAllText: { fontSize: 13, fontWeight: "600" },
  upgradeCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
  },
  upgradeButton: {
    alignSelf: "flex-start",
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: "#6F2C91",
    justifyContent: "center",
  },
  upgradeButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
