import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, RefreshCw } from "lucide-react-native";

function useSpinAnimation(spinning: boolean) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (spinning) {
      spinValue.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(spinValue, { toValue: 1, duration: 700, useNativeDriver: true })
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      spinValue.setValue(0);
    }
    return () => loopRef.current?.stop();
  }, [spinning, spinValue]);
  return spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
}
import Svg, { Path, G } from "react-native-svg";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { isAccessDenied } from "@/utils/apiErrors";
import type { PortfolioHolding } from "@/api/portfolio";

const PALETTE = [
  "#3b82f6", "#14b8a6", "#a855f7", "#f97316",
  "#ef4444", "#eab308", "#06b6d4", "#8b5cf6",
  "#ec4899", "#84cc16",
];
const CASH_COLOR = "#22c55e";
const REMAINDER = "rgba(110,100,112,0.35)";

type Slice = {
  key: string;
  label: string;
  color: string;
  percent: number;
  avgPrice: number | null;
  currentPrice: number | null;
  returnPct: number | null;
  positionId?: number;
};

function buildSlices(
  holdings: PortfolioHolding[],
  cashWeight: number,
  cash: number
): Slice[] {
  const slices: Slice[] = holdings.map((h, i) => ({
    key: String(h.position_id),
    label: h.symbol,
    color: PALETTE[i % PALETTE.length],
    percent: h.weight * 100,
    avgPrice: h.avg_price,
    currentPrice: h.current_price,
    returnPct: h.position_return,
    positionId: h.position_id,
  }));
  slices.push({
    key: "CASH",
    label: "Tiền mặt",
    color: CASH_COLOR,
    percent: cashWeight * 100,
    avgPrice: null,
    currentPrice: cash,
    returnPct: null,
  });
  return slices;
}

// SVG donut arc path helpers
function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number, outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  // clamp sweep to avoid degenerate arc at exactly 360
  const sweep = Math.min(endDeg - startDeg, 359.99);
  const large = sweep > 180 ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, startDeg + sweep);
  const i1 = polarToCartesian(cx, cy, innerR, startDeg + sweep);
  const i2 = polarToCartesian(cx, cy, innerR, startDeg);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

function DonutChart({ slices }: { slices: Slice[] }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 90;
  const innerR = outerR * 0.58;

  const positive = slices.filter((s) => s.percent > 0);
  if (positive.length === 0) return null;

  const paths: { d: string; color: string }[] = [];
  let accDeg = 0;

  for (const s of positive) {
    const sweep = (s.percent / 100) * 360;
    paths.push({ d: arcPath(cx, cy, outerR, innerR, accDeg, accDeg + sweep), color: s.color });
    accDeg += sweep;
  }

  if (accDeg < 359.5) {
    paths.push({ d: arcPath(cx, cy, outerR, innerR, accDeg, 360), color: REMAINDER });
  }

  return (
    <Svg width={size} height={size}>
      <G>
        {paths.map((p, i) => (
          <Path key={i} d={p.d} fill={p.color} />
        ))}
      </G>
    </Svg>
  );
}

function formatNum(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function PortfolioScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [marketId, setMarketId] = useState<1 | 2>(2);

  const { data, isLoading, error, refetch, isRefetching } = usePortfolio(marketId);
  const spin = useSpinAnimation(isRefetching);

  const slices = data
    ? buildSlices(data.holdings, data.cash_weight, data.cash)
    : [];
  const visibleSlices = slices.filter((s) => s.percent > 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
            Danh mục
          </Text>
          <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
            Theo dõi danh mục và hiệu suất
          </Text>
        </View>
      </View>

      {/* Market toggle */}
      <View style={styles.toggleRow}>
        <SegmentedToggle
          options={[{ label: "Cổ phiếu", value: 2 }, { label: "Crypto", value: 1 }]}
          selected={marketId}
          onSelect={(v) => setMarketId(v as 1 | 2)}
        />
      </View>

      {isAccessDenied(error) ? (
        <AccessDeniedState
          title="Portfolio bị khóa"
          hint="Nâng cấp gói của bạn để xem danh mục đầu tư trên thị trường này."
        />
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : !data ? (
        <View style={styles.centered}>
          <Text style={{ color: c.textMuted }}>Không có dữ liệu portfolio</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={c.brand} />
          }
        >
          {/* KPI grid: 2-column top, full-width bottom */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiTile, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Tổng giá trị</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {formatNum(data.total_portfolio_value)}
              </Text>
            </View>
            <View style={[styles.kpiTile, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Tiền mặt</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {formatNum(data.cash)}
                <Text style={[styles.kpiSub, { color: c.textMuted }]}>
                  {" "}({(data.cash_weight * 100).toFixed(1)}%)
                </Text>
              </Text>
            </View>
            <View style={[styles.kpiTileFull, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.kpiLabel, { color: c.textMuted }]}>Vị thế</Text>
              <Text style={[styles.kpiValue, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                {data.holdings.length}
              </Text>
            </View>
          </View>

          {/* Allocation card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                Phân bổ
              </Text>
              <Pressable onPress={() => refetch()} hitSlop={8}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <RefreshCw size={16} color={c.textMuted} />
                </Animated.View>
              </Pressable>
            </View>

            {/* Donut chart */}
            <View style={styles.donutWrap}>
              <DonutChart slices={slices} />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {visibleSlices.map((s, i) => (
                <View key={s.key}>
                  {i > 0 && <View style={[styles.legendDivider, { backgroundColor: c.divider }]} />}
                  <View style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: s.color }]} />
                    <Text style={[styles.legendLabel, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
                      {s.label}
                    </Text>
                    <Text style={[styles.legendPct, { color: c.textMuted }]}>
                      {s.percent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Holding breakdown */}
          <View style={[styles.breakdownCard, { backgroundColor: c.card, borderColor: c.cardBorder, borderTopColor: c.brand + "40" }]}>
            <Text style={[styles.breakdownTitle, { color: c.textMuted }]}>
              CHI TIẾT DANH MỤC
            </Text>
            <View style={styles.holdingList}>
              {slices.map((s, i) => {
                const retColor = s.returnPct == null
                  ? c.textMuted
                  : s.returnPct >= 0 ? c.positive : c.negative;
                const retText = s.returnPct == null
                  ? "—"
                  : `${s.returnPct >= 0 ? "+" : ""}${s.returnPct.toFixed(2)}%`;

                return (
                  <Pressable
                    key={s.key}
                    style={[styles.holdingCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}
                    onPress={s.positionId ? () =>
                      router.push({ pathname: "/position/[id]", params: { id: String(s.positionId), marketId: String(marketId) } })
                    : undefined}
                  >
                    {/* Row: dot + name + % */}
                    <View style={[styles.holdingHeader, { borderBottomColor: c.divider }]}>
                      <View style={styles.holdingHeaderLeft}>
                        <View style={[styles.dot, { backgroundColor: s.color }]} />
                        <Text style={[styles.holdingSymbol, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
                          {s.label}
                        </Text>
                      </View>
                      <Text style={[styles.holdingPct, { color: c.textMuted }]}>
                        {s.percent === 0 ? "0%" : `${s.percent.toFixed(2)}%`}
                      </Text>
                    </View>

                    {/* Detail grid */}
                    <View style={styles.holdingDetail}>
                      <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: c.textMuted }]}>Vào</Text>
                        <Text style={[styles.detailValue, { color: c.textPrimary }]}>
                          {formatNum(s.avgPrice)}
                        </Text>
                      </View>
                      <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: c.textMuted }]}>Hiện tại</Text>
                        <Text style={[styles.detailValue, { color: c.textPrimary }]}>
                          {formatNum(s.currentPrice)}
                        </Text>
                      </View>
                      <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: c.textMuted }]}>Lãi/lỗ</Text>
                        <Text style={[styles.detailValue, { color: retColor, fontFamily: typography.familyMedium }]}>
                          {retText}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
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
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 2 },
  pageTitle: { fontSize: 22, fontWeight: "700" },
  pageSubtitle: { fontSize: 12, marginTop: 1 },
  toggleRow: { paddingHorizontal: 18, paddingBottom: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },

  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiTile: { flex: 1, minWidth: "45%", borderWidth: 1, borderRadius: 14, padding: 14 },
  kpiTileFull: { width: "100%", borderWidth: 1, borderRadius: 14, padding: 14 },
  kpiLabel: { fontSize: 11, fontWeight: "500" },
  kpiValue: { fontSize: 17, fontWeight: "600", marginTop: 6 },
  kpiSub: { fontSize: 13, fontWeight: "400" },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },

  donutWrap: { alignItems: "center", paddingVertical: 12 },

  legend: { marginTop: 4 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  legendDivider: { height: 1 },
  legendLabel: { flex: 1, fontSize: 14 },
  legendPct: { fontSize: 14, fontVariant: ["tabular-nums"] },

  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },

  breakdownCard: {
    borderWidth: 1,
    borderTopWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  holdingList: { gap: 10 },
  holdingCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  holdingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  holdingHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  holdingSymbol: { fontSize: 14 },
  holdingPct: { fontSize: 13, fontVariant: ["tabular-nums"] },
  holdingDetail: { flexDirection: "row", gap: 0 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 13, marginTop: 3, fontVariant: ["tabular-nums"] },
});
