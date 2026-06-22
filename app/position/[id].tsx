import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";

import { useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { timeAgo } from "@/utils/timeAgo";
import { usePositionDetail, usePositionLive } from "@/hooks/usePositions";
import type { PositionOrder, PositionStatus } from "@/api/positions";

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

function fmt(n: number | null, decimals = 2): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

function fmtSigned(n: number, suffix = "%"): string {
  if (n === 0) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(4)}${suffix}`;
}

function getStatusStyle(status: PositionStatus, c: ReturnType<typeof useThemeColors>) {
  switch (status) {
    case "running": return { bg: c.statusRunningBg, text: c.statusRunningText };
    case "opened":
    case "opening": return { bg: c.statusOpenedBg, text: c.statusOpenedText };
    case "closing":
    case "cancelling": return { bg: c.statusClosingBg, text: c.statusClosingText };
    default: return { bg: c.statusClosedBg, text: c.statusClosedText };
  }
}

export default function PositionDetailScreen() {
  const { id, marketId } = useLocalSearchParams<{ id: string; marketId: string }>();
  const router = useRouter();
  const c = useThemeColors();
  const { t } = useTranslation();

  const mId = (Number(marketId) || 1) as 1 | 2;
  const pId = Number(id) || 0;

  const { data: detail, isLoading, refetch, isRefetching } = usePositionDetail(mId, pId);
  const { data: live } = usePositionLive(mId, pId);
  const spin = useSpinAnimation(isRefetching);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
        <View style={styles.centered}><ActivityIndicator color={c.brand} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
        <View style={styles.centered}>
          <Text style={{ color: c.textMuted }}>{t("positions.detail.notFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuy = detail.side === "buy";
  const borderColor = isBuy ? c.positive : c.negative;
  const statusStyle = getStatusStyle(detail.status, c);

  const currentPrice = live?.current_price ?? null;
  const positionReturn = live?.position_return ?? null;
  const currentPnl = live?.current_pnl ?? null;

  // Capacity bar
  const scaleMax = Math.max(detail.capacity, detail.size, 100);
  const sizePct = Math.min((detail.size / scaleMax) * 100, 100);
  const capPct = Math.min((detail.capacity / scaleMax) * 100, 100);

  // Dist to SL
  const distToSL =
    currentPrice != null && detail.stop_loss != null && detail.avg_price !== 0
      ? (Math.abs(currentPrice - detail.stop_loss) / detail.avg_price) * 100
      : null;
  const distColor =
    distToSL == null ? c.textMuted
    : distToSL > 5 ? c.positive
    : distToSL >= 2 ? "#f59e0b"
    : c.negative;

  const retColor = positionReturn == null ? c.textMuted : positionReturn >= 0 ? c.positive : c.negative;
  const pnlColor = currentPnl == null ? c.textMuted : currentPnl >= 0 ? c.positive : c.negative;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
          {detail.symbol}
        </Text>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: c.card, borderColor: c.cardBorder, borderLeftColor: borderColor }]}>
          {/* Symbol + badges */}
          <View style={styles.badgeRow}>
            <Text style={[styles.symbol, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
              {detail.symbol}
            </Text>
            <Badge bg={isBuy ? c.buyBg : c.sellBg} textColor={isBuy ? c.buyText : c.sellText}>
              {t(`positionsEnum.side.${detail.side}`)}
            </Badge>
            <Badge bg={statusStyle.bg} textColor={statusStyle.text}>
              {t(`positionsEnum.status.${detail.status}`)}
            </Badge>
            <Badge bg={c.termBg} textColor={c.termText}>
              {t(`positionsEnum.term.${detail.term}`)}
            </Badge>
          </View>
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            ID #{detail.id} · {timeAgo(detail.timestamp, t)}
          </Text>

          {/* LIVE sub-card */}
          <View style={[styles.liveCard, { borderColor: c.cardBorder }]}>
            <View style={[styles.liveHeader, { borderBottomColor: c.cardBorder }]}>
              <View style={styles.liveIndicator}>
                <View style={[styles.liveDot, { backgroundColor: currentPrice != null ? c.positive : c.textFaint }]} />
                <Text style={[styles.liveLabel, { color: c.textMuted }]}>LIVE</Text>
              </View>
              <Pressable style={styles.liveRefresh} onPress={() => refetch()}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <RefreshCw size={13} color={c.textMuted} />
                </Animated.View>
                <Text style={[styles.liveRefreshText, { color: c.textMuted }]}>{t("positions.detail.refreshLive")}</Text>
              </Pressable>
            </View>

            {/* 2×2 metrics grid */}
            <View style={styles.liveGrid}>
              <LiveCell label={t("positions.detail.currentPrice")} value={currentPrice != null ? fmt(currentPrice) : "—"} valueColor={c.textPrimary} border={["right", "bottom"]} c={c} />
              <LiveCell label={t("positions.detail.unrealizedPnl")} value={currentPnl != null ? `${currentPnl >= 0 ? "+" : ""}${currentPnl.toFixed(2)}%` : "—"} valueColor={pnlColor} border={["bottom"]} c={c} />
              <LiveCell label={t("positions.detail.positionReturn")} value={positionReturn != null ? `${positionReturn >= 0 ? "+" : ""}${positionReturn.toFixed(2)}%` : "—"} valueColor={retColor} border={["right"]} c={c} />
              <LiveCell label={t("positions.detail.distToStop")} value={distToSL != null ? `${distToSL.toFixed(2)}%` : "—"} valueColor={distColor} border={[]} c={c} />
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsCard, { borderColor: c.cardBorder }]}>
            <StatCell label={t("positions.columns.avgPrice")} value={fmt(detail.avg_price)} valueColor={c.textPrimary} border="right" c={c} />
            <StatCell label={t("positions.detail.stopLoss")} value={detail.stop_loss != null ? fmt(detail.stop_loss) : "—"} valueColor={c.negative} border="right" c={c} />
            <StatCell
              label={t("positions.detail.bookedPnl")}
              value={detail.booked_pnl !== 0 ? `${detail.booked_pnl > 0 ? "+" : ""}${detail.booked_pnl.toFixed(2)}%` : "—"}
              valueColor={detail.booked_pnl > 0 ? c.positive : detail.booked_pnl < 0 ? c.negative : c.textMuted}
              c={c}
            />
          </View>

          {/* Capacity */}
          <View style={[styles.capacitySection, { borderColor: c.cardBorder }]}>
            <Text style={[styles.capLabel, { color: c.textMuted }]}>{t("positions.columns.capacity").toUpperCase()}</Text>
            <View style={styles.capContent}>
              <View style={styles.capBarWrap}>
                {/* Size label above */}
                <Text style={[styles.capPctLabel, { color: isBuy ? c.positive : c.negative, left: `${sizePct}%` }]}>
                  {detail.size.toFixed(0)}%
                </Text>
                <View style={[styles.capTrack, { backgroundColor: c.capacityTrackBg }]}>
                  <View style={[styles.capFillFaint, { width: `${capPct}%`, backgroundColor: isBuy ? c.positive : c.negative, opacity: 0.25 }]} />
                  <View style={[styles.capFill, { width: `${sizePct}%`, backgroundColor: isBuy ? c.positive : c.negative }]} />
                </View>
                {/* Capacity label below */}
                <Text style={[styles.capPctLabel, { color: c.textMuted, left: `${capPct}%` }]}>
                  {detail.capacity.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.capLegend}>
                <View style={styles.capLegendRow}>
                  <View style={[styles.capDot, { backgroundColor: isBuy ? c.positive : c.negative }]} />
                  <Text style={[styles.capLegendText, { color: c.textMuted }]}>{t("positions.detail.current")}</Text>
                </View>
                <View style={styles.capLegendRow}>
                  <View style={[styles.capDot, { backgroundColor: isBuy ? c.positive : c.negative, opacity: 0.3 }]} />
                  <Text style={[styles.capLegendText, { color: c.textMuted }]}>{t("positions.detail.max")}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Order history */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
            {t("positions.detail.orders")}
          </Text>
          <Text style={[styles.sectionSub, { color: c.textMuted }]}>
            {t("positions.detail.ordersSubtitle")}
          </Text>
          {detail.orders.length === 0 ? (
            <Text style={{ color: c.textMuted, marginTop: 16 }}>{t("positions.detail.noOrders")}</Text>
          ) : (
            <View style={styles.orderList}>
              {detail.orders.map((order, idx) => (
                <OrderCard key={order.id} order={order} idx={idx} c={c} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ bg, textColor, children }: { bg: string; textColor: string; children: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{children}</Text>
    </View>
  );
}

function LiveCell({
  label, value, valueColor, border, c,
}: {
  label: string; value: string; valueColor: string;
  border: ("right" | "bottom")[];
  c: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[
      styles.liveCell,
      border.includes("right") && { borderRightWidth: 1, borderRightColor: c.cardBorder },
      border.includes("bottom") && { borderBottomWidth: 1, borderBottomColor: c.cardBorder },
    ]}>
      <Text style={[styles.cellLabel, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.cellValue, { color: valueColor, fontFamily: typography.familySemiBold }]}>{value}</Text>
    </View>
  );
}

function StatCell({
  label, value, valueColor, border, c,
}: {
  label: string; value: string; valueColor: string;
  border?: "right"; c: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[
      styles.statCell,
      border === "right" && { borderRightWidth: 1, borderRightColor: c.cardBorder },
    ]}>
      <Text style={[styles.cellLabel, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.cellValue, { color: valueColor, fontFamily: typography.familySemiBold }]}>{value}</Text>
    </View>
  );
}

function OrderCard({
  order, idx, c,
}: {
  order: PositionOrder; idx: number;
  c: ReturnType<typeof useThemeColors>;
}) {
  const { t } = useTranslation();
  const isBuy = order.side === "buy";
  const orderPnlColor = order.order_pnl === 0 ? c.textMuted : order.order_pnl > 0 ? c.positive : c.negative;
  const posPnlColor = order.position_pnl === 0 ? c.textMuted : order.position_pnl > 0 ? c.positive : c.negative;

  return (
    <View style={[styles.orderCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
      {/* Header: number + timestamp | side badge */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={[styles.orderIdx, { color: c.textMuted, fontFamily: typography.familySemiBold }]}>
            {idx + 1}.
          </Text>
          <Text style={[styles.orderTime, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
            {timeAgo(order.timestamp, t)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isBuy ? c.buyBg : c.sellBg }]}>
          <Text style={[styles.badgeText, { color: isBuy ? c.buyText : c.sellText }]}>
            {t(`ordersEnum.side.${order.side}`)}
          </Text>
        </View>
      </View>

      {/* Row 1: Type | Price | Qty */}
      <View style={styles.orderGrid}>
        <View style={styles.orderCol}>
          <Text style={[styles.cellLabel, { color: c.textMuted }]}>{t("positions.detail.col.type").toUpperCase()}</Text>
          <Text style={[styles.orderVal, { color: c.textMuted }]}>
            {t(`positions.detail.orderType.${order.order_type}`)}
          </Text>
        </View>
        <View style={styles.orderCol}>
          <Text style={[styles.cellLabel, { color: c.textMuted }]}>{t("positions.detail.col.price").toUpperCase()}</Text>
          <Text style={[styles.orderVal, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
            {order.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}
          </Text>
        </View>
        <View style={styles.orderCol}>
          <Text style={[styles.cellLabel, { color: c.textMuted }]}>{t("positions.detail.col.qty").toUpperCase()}</Text>
          <Text style={[styles.orderVal, { color: c.textPrimary }]}>
            {order.quantity.toFixed(4)}%
          </Text>
        </View>
      </View>

      {/* Row 2: Order P&L | Position P&L */}
      <View style={[styles.orderGrid, styles.orderGridPnl]}>
        <View style={styles.orderCol}>
          <Text style={[styles.cellLabel, { color: c.textMuted }]}>{t("positions.detail.col.orderPnl").toUpperCase()}</Text>
          <Text style={[styles.orderVal, { color: orderPnlColor }]}>
            {order.order_pnl === 0 ? "—" : `${order.order_pnl > 0 ? "+" : ""}${order.order_pnl.toFixed(6)}%`}
          </Text>
        </View>
        <View style={styles.orderCol}>
          <Text style={[styles.cellLabel, { color: c.textMuted }]}>{t("positions.detail.col.positionPnl").toUpperCase()}</Text>
          <Text style={[styles.orderVal, { color: posPnlColor }]}>
            {order.position_pnl === 0 ? "—" : `${order.position_pnl > 0 ? "+" : ""}${order.position_pnl.toFixed(6)}%`}
          </Text>
        </View>
        <View style={styles.orderCol} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scroll: { padding: 14, paddingBottom: 40, gap: 0 },

  heroCard: {
    borderWidth: 1, borderLeftWidth: 4, borderRadius: 14,
    overflow: "hidden", marginBottom: 20,
  },
  badgeRow: {
    flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    gap: 6, padding: 14, paddingBottom: 4,
  },
  symbol: { fontSize: 22, fontWeight: "700", marginRight: 2 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  metaText: { fontSize: 11, paddingHorizontal: 14, paddingBottom: 12 },

  // LIVE card
  liveCard: { borderTopWidth: 1, borderBottomWidth: 1 },
  liveHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1,
  },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  liveRefresh: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveRefreshText: { fontSize: 12 },
  liveGrid: { flexDirection: "row", flexWrap: "wrap" },
  liveCell: { width: "50%", padding: 12 },

  // Stats card
  statsCard: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1 },
  statCell: { flex: 1, padding: 12 },

  cellLabel: { fontSize: 9.5, fontWeight: "600", letterSpacing: 0.4 },
  cellValue: { fontSize: 16, fontWeight: "600", marginTop: 4, fontVariant: ["tabular-nums"] },

  // Capacity
  capacitySection: { borderTopWidth: 0, padding: 14 },
  capLabel: { fontSize: 9.5, fontWeight: "600", letterSpacing: 0.4, marginBottom: 10 },
  capContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  capBarWrap: { flex: 1, position: "relative" },
  capPctLabel: {
    position: "absolute", fontSize: 10, fontWeight: "600",
    fontVariant: ["tabular-nums"], transform: [{ translateX: -12 }],
  },
  capTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginVertical: 14, position: "relative" },
  capFillFaint: { position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 4 },
  capFill: { position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 4 },
  capLegend: { gap: 6 },
  capLegendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  capDot: { width: 8, height: 8, borderRadius: 4 },
  capLegendText: { fontSize: 11 },

  // Orders section
  section: {},
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 2 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  orderList: { gap: 10 },

  orderCard: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12,
  },
  orderHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },
  orderHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderIdx: { fontSize: 12 },
  orderTime: { fontSize: 13 },
  orderGrid: { flexDirection: "row", gap: 0 },
  orderGridPnl: { marginTop: 8 },
  orderCol: { flex: 1 },
  orderVal: { fontSize: 13, marginTop: 3, fontVariant: ["tabular-nums"] },
});
