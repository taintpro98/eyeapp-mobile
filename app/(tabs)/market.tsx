import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { AppHeader } from "@/components/AppHeader";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { useSignals } from "@/hooks/useSignals";

const MOCK_SENTIMENT = [
  { label: "Bullish", pct: 62, color: "#16a34a" },
  { label: "Neutral", pct: 24, color: "#8B5FBF" },
  { label: "Bearish", pct: 14, color: "#dc2626" },
];

const MOCK_TICKERS = [
  { symbol: "HPG", name: "Hoa Phat Group", price: "27,650", change: "+3.2%", positive: true },
  { symbol: "FPT", name: "FPT Corporation", price: "134,500", change: "+2.4%", positive: true },
  { symbol: "VHM", name: "Vinhomes", price: "42,100", change: "+1.8%", positive: true },
  { symbol: "VIC", name: "Vingroup", price: "41,250", change: "-1.1%", positive: false },
  { symbol: "MWG", name: "Mobile World", price: "61,800", change: "-0.6%", positive: false },
];

export default function MarketScreen() {
  const c = useThemeColors();
  const [marketId, setMarketId] = useState<1 | 2>(2);

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
              Market
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              Vietnam equities · HOSE
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

        {/* Mini KPI row */}
        <View style={styles.kpiRow}>
          <KpiMini label="VN-Index" value="1,284.32" change="+0.84%" positive colors={c} />
          <KpiMini label="VN30" value="1,342.10" change="+0.62%" positive colors={c} />
          <KpiMini label="HOSE Value" value="18,420 B" change="Session" colors={c} />
          <KpiMini label="Net Foreign" value="+312.4 B" change="Today" colors={c} />
        </View>

        {/* Top movers */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.cardBorder, shadowColor: c.cardShadow },
          ]}
        >
          <Text
            style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}
          >
            Top movers
          </Text>
          <Text style={[styles.cardSub, { color: c.textMuted }]}>
            Most active by turnover
          </Text>
          <View style={{ marginTop: 12, gap: 9 }}>
            {MOCK_TICKERS.map((t, i) => (
              <View key={t.symbol}>
                <View style={styles.tickerRow}>
                  <View>
                    <Text
                      style={[
                        styles.tickerSymbol,
                        { color: c.textPrimary, fontFamily: typography.familySemiBold },
                      ]}
                    >
                      {t.symbol}
                    </Text>
                    <Text style={[styles.tickerName, { color: c.textMuted }]}>
                      {t.name}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.tickerPrice,
                        { color: c.textPrimary, fontFamily: typography.familySemiBold },
                      ]}
                    >
                      {t.price}
                    </Text>
                    <Text
                      style={[
                        styles.tickerChange,
                        { color: t.positive ? c.positive : c.negative },
                      ]}
                    >
                      {t.change}
                    </Text>
                  </View>
                </View>
                {i < MOCK_TICKERS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: c.divider }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Market sentiment */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.cardBorder, shadowColor: c.cardShadow },
          ]}
        >
          <Text
            style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}
          >
            Market sentiment
          </Text>
          <View style={{ marginTop: 13, gap: 11 }}>
            {MOCK_SENTIMENT.map((s) => (
              <View key={s.label}>
                <View style={styles.sentimentHeader}>
                  <Text style={[styles.sentimentLabel, { color: c.textMuted }]}>
                    {s.label}
                  </Text>
                  <Text
                    style={[
                      styles.sentimentPct,
                      { color: c.textPrimary, fontFamily: typography.familySemiBold },
                    ]}
                  >
                    {s.pct}%
                  </Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: c.capacityTrackBg }]}>
                  <View
                    style={[styles.barFill, { width: `${s.pct}%`, backgroundColor: s.color }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KpiMini({
  label,
  value,
  change,
  positive,
  colors: c,
}: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      style={[
        kpiStyles.card,
        { backgroundColor: c.card, borderColor: c.cardBorder, shadowColor: c.cardShadow },
      ]}
    >
      <Text style={[kpiStyles.label, { color: c.textMuted }]}>{label}</Text>
      <Text
        style={[
          kpiStyles.value,
          { color: c.textPrimary, fontFamily: typography.familySemiBold },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          kpiStyles.change,
          { color: positive ? c.positive : c.textMuted },
        ]}
      >
        {change}
      </Text>
    </View>
  );
}

const kpiStyles = StyleSheet.create({
  card: {
    width: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontSize: 11.5, fontWeight: "500" },
  value: { fontSize: 19, fontWeight: "600", marginTop: 5 },
  change: { fontSize: 12, fontWeight: "500", marginTop: 2 },
});

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
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
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
  tickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tickerSymbol: { fontSize: 14, fontWeight: "600" },
  tickerName: { fontSize: 11, marginTop: 1 },
  tickerPrice: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  tickerChange: { fontSize: 11.5, fontWeight: "500", marginTop: 1 },
  divider: { height: 1, marginTop: 9 },
  sentimentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sentimentLabel: { fontSize: 12 },
  sentimentPct: { fontSize: 12, fontWeight: "600" },
  barTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
});
