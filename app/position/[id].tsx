import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { usePositionDetail, usePositionLive } from "@/hooks/usePositions";
import type { PositionOrder, PositionSide, PositionStatus } from "@/api/positions";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function termLabel(term: string): string {
  return term === "short_term" ? "Intraday" : "Swing";
}

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PositionDetailScreen() {
  const { id, marketId } = useLocalSearchParams<{
    id: string;
    marketId: string;
  }>();
  const router = useRouter();
  const c = useThemeColors();

  const mId = (Number(marketId) || 1) as 1 | 2;
  const pId = Number(id) || 0;

  const {
    data: detail,
    isLoading,
    refetch,
    isRefetching,
  } = usePositionDetail(mId, pId);

  const { data: live } = usePositionLive(mId, pId);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
        <View style={styles.centered}>
          <Text style={{ color: c.textMuted }}>Position not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuy = detail.side === "buy";
  const borderColor = isBuy ? c.positive : c.negative;
  const sideBadge = isBuy
    ? { bg: c.buyBg, text: c.buyText, label: "BUY" }
    : { bg: c.sellBg, text: c.sellText, label: "SELL" };
  const statusStyle = getStatusStyle(detail.status, c);

  const currentPrice = live?.current_price ?? null;
  const positionReturn = live?.position_return ?? null;
  const currentPnl = live?.current_pnl ?? null;
  const capacityPct = Math.min(Math.round(detail.capacity), 100);

  const returnColor =
    positionReturn != null
      ? positionReturn >= 0
        ? c.positive
        : c.negative
      : c.textMuted;
  const returnText =
    positionReturn != null
      ? `${positionReturn >= 0 ? "+" : ""}${positionReturn.toFixed(2)}%`
      : "—";
  const pnlColor =
    currentPnl != null
      ? currentPnl >= 0
        ? c.positive
        : c.negative
      : c.textMuted;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: c.textPrimary, fontFamily: typography.familyBold },
          ]}
        >
          {detail.symbol}
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.headerBtn} onPress={() => refetch()}>
          <RefreshCw size={18} color={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={c.brand}
          />
        }
      >
        {/* Main card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.card,
              borderColor: c.cardBorder,
              borderLeftColor: borderColor,
              shadowColor: c.cardShadow,
            },
          ]}
        >
          {/* Symbol header */}
          <View style={styles.cardHeader}>
            <View style={styles.symbolRow}>
              <Text
                style={[
                  styles.symbol,
                  { color: c.textPrimary, fontFamily: typography.familyBold },
                ]}
              >
                {detail.symbol}
              </Text>
              <View style={[styles.badge, { backgroundColor: sideBadge.bg }]}>
                <Text style={[styles.badgeText, { color: sideBadge.text }]}>
                  {sideBadge.label}
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {statusLabel(detail.status)}
              </Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: c.textMuted }]}>
              {timeAgo(detail.timestamp)}
            </Text>
            <Text style={[styles.metaDot, { color: c.divider }]}>·</Text>
            <View style={[styles.termBadge, { backgroundColor: c.termBg }]}>
              <Text style={[styles.termText, { color: c.termText }]}>
                {termLabel(detail.term)}
              </Text>
            </View>
          </View>

          {/* Data grid */}
          <View style={styles.dataGrid}>
            <DataCell
              label="AVG PRICE"
              value={formatNumber(detail.avg_price)}
              sub={
                detail.stop_loss != null
                  ? formatNumber(detail.stop_loss)
                  : undefined
              }
              subColor={c.negative}
              valueColor={c.textPrimary}
              labelColor={c.textFaint}
            />
            <DataCell
              label="SIZE"
              value={formatNumber(detail.size)}
              valueColor={c.textMuted}
              labelColor={c.textFaint}
            />

            {/* Capacity */}
            <View style={styles.fullWidth}>
              <Text style={[styles.dataLabel, { color: c.textFaint }]}>
                CAPACITY
              </Text>
              <View style={styles.capacityRow}>
                <View
                  style={[
                    styles.capacityTrack,
                    { backgroundColor: c.capacityTrackBg },
                  ]}
                >
                  <View
                    style={[
                      styles.capacityFill,
                      {
                        width: `${capacityPct}%`,
                        backgroundColor: isBuy ? c.positive : c.negative,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.capacityPct, { color: c.textMuted }]}>
                  {capacityPct}%
                </Text>
              </View>
            </View>

            <DataCell
              label="CURRENT"
              value={currentPrice != null ? formatNumber(currentPrice) : "—"}
              valueColor={c.textPrimary}
              labelColor={c.textFaint}
              bold
            />
            <DataCell
              label="RETURN"
              value={returnText}
              valueColor={returnColor}
              labelColor={c.textFaint}
              bold
            />

            <DataCell
              label="UNREALIZED P&L"
              value={
                currentPnl != null ? formatNumber(currentPnl) : "—"
              }
              valueColor={pnlColor}
              labelColor={c.textFaint}
            />
            <DataCell
              label="BOOKED P&L"
              value={formatNumber(detail.booked_pnl)}
              valueColor={
                detail.booked_pnl >= 0 ? c.positive : c.negative
              }
              labelColor={c.textFaint}
            />
          </View>
        </View>

        {/* Orders */}
        {detail.orders && detail.orders.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: c.textPrimary, fontFamily: typography.familySemiBold },
              ]}
            >
              Orders ({detail.orders.length})
            </Text>
            {detail.orders.map((order) => (
              <OrderRow key={order.id} order={order} colors={c} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DataCell({
  label,
  value,
  sub,
  subColor,
  valueColor,
  labelColor,
  bold,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  valueColor: string;
  labelColor: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.dataCell}>
      <Text style={[styles.dataLabel, { color: labelColor }]}>{label}</Text>
      <Text
        style={[
          styles.dataValue,
          {
            color: valueColor,
            fontFamily: bold
              ? typography.familySemiBold
              : typography.familyMedium,
          },
        ]}
      >
        {value}
      </Text>
      {sub && (
        <Text style={[styles.dataSub, { color: subColor }]}>{sub}</Text>
      )}
    </View>
  );
}

function OrderRow({
  order,
  colors: c,
}: {
  order: PositionOrder;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const isBuy = order.side === "buy";
  const sideColor = isBuy ? c.positive : c.negative;
  const pnlColor =
    order.order_pnl >= 0 ? c.positive : c.negative;

  return (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: c.card, borderColor: c.cardBorder },
      ]}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderLeft}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isBuy ? c.buyBg : c.sellBg,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isBuy ? c.buyText : c.sellText },
              ]}
            >
              {order.side.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: c.termBg },
            ]}
          >
            <Text style={[styles.badgeText, { color: c.termText }]}>
              {order.order_type}
            </Text>
          </View>
        </View>
        <Text style={[styles.orderDate, { color: c.textMuted }]}>
          {formatDate(order.created_at)}
        </Text>
      </View>
      <View style={styles.orderData}>
        <View style={styles.orderDataItem}>
          <Text style={[styles.dataLabel, { color: c.textFaint }]}>PRICE</Text>
          <Text style={[styles.orderVal, { color: c.textPrimary }]}>
            {formatNumber(order.price)}
          </Text>
        </View>
        <View style={styles.orderDataItem}>
          <Text style={[styles.dataLabel, { color: c.textFaint }]}>QTY</Text>
          <Text style={[styles.orderVal, { color: c.textMuted }]}>
            {formatNumber(order.quantity)}
          </Text>
        </View>
        <View style={styles.orderDataItem}>
          <Text style={[styles.dataLabel, { color: c.textFaint }]}>P&L</Text>
          <Text style={[styles.orderVal, { color: pnlColor }]}>
            {formatNumber(order.order_pnl)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getStatusStyle(
  status: PositionStatus,
  c: ReturnType<typeof useThemeColors>
): { bg: string; text: string } {
  switch (status) {
    case "running":
      return { bg: c.statusRunningBg, text: c.statusRunningText };
    case "opened":
    case "opening":
      return { bg: c.statusOpenedBg, text: c.statusOpenedText };
    case "closing":
    case "cancelling":
      return { bg: c.statusClosingBg, text: c.statusClosingText };
    default:
      return { bg: c.statusClosedBg, text: c.statusClosedText };
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scroll: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 15,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  symbol: {
    fontSize: 20,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  metaText: { fontSize: 11 },
  metaDot: { fontSize: 11 },
  termBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  termText: {
    fontSize: 10,
    fontWeight: "500",
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  dataCell: {
    width: "46%",
  },
  fullWidth: {
    width: "100%",
  },
  dataLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  dataValue: {
    fontSize: 14,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  dataSub: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  capacityTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  capacityFill: {
    height: "100%",
    borderRadius: 3,
  },
  capacityPct: {
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderLeft: {
    flexDirection: "row",
    gap: 6,
  },
  orderDate: {
    fontSize: 10.5,
  },
  orderData: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderDataItem: {
    flex: 1,
  },
  orderVal: {
    fontSize: 13,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
});
