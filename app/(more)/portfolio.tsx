import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { usePortfolio } from "@/hooks/usePortfolio";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function PortfolioScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = usePortfolio(1);

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
          Portfolio
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : !data ? (
        <View style={styles.centered}>
          <Text style={{ color: c.textMuted }}>No portfolio data</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={c.brand} />
          }
        >
          {/* KPI tiles */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiTile, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Total value</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {formatCurrency(data.total_portfolio_value)}
              </Text>
            </View>
            <View style={[styles.kpiTile, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Cash</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {formatCurrency(data.cash)}
              </Text>
              <Text style={[styles.kpiSub, { color: c.textMuted }]}>
                {data.cash_weight.toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.kpiTile, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Positions</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {data.holdings.length}
              </Text>
            </View>
          </View>

          {/* Holdings */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, shadowColor: c.cardShadow }]}>
            <Text style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
              Allocation
            </Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              {data.holdings.map((h, i) => {
                const retColor =
                  h.position_return != null
                    ? h.position_return >= 0
                      ? c.positive
                      : c.negative
                    : c.textMuted;
                const retText =
                  h.position_return != null
                    ? `${h.position_return >= 0 ? "+" : ""}${h.position_return.toFixed(2)}%`
                    : "—";
                return (
                  <View key={h.position_id}>
                    <View style={styles.holdingRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.holdingSymbol, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                          {h.symbol}
                        </Text>
                      </View>
                      <Text style={[styles.holdingReturn, { color: retColor }]}>
                        {retText}
                      </Text>
                      <Text style={[styles.holdingWeight, { color: c.textMuted }]}>
                        {h.weight.toFixed(1)}%
                      </Text>
                    </View>
                    {i < data.holdings.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: c.divider }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 18, gap: 14 },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
  },
  kpiLabel: { fontSize: 10.5, fontWeight: "500" },
  kpiValue: { fontSize: 15, fontWeight: "600", marginTop: 5 },
  kpiSub: { fontSize: 11, marginTop: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  holdingSymbol: { fontSize: 14, fontWeight: "600" },
  holdingReturn: { fontSize: 12, fontWeight: "500", fontVariant: ["tabular-nums"], width: 60, textAlign: "right" },
  holdingWeight: { fontSize: 12, fontVariant: ["tabular-nums"], width: 40, textAlign: "right" },
  divider: { height: 1 },
});
