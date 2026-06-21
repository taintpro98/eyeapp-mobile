import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import type { Position } from "@/api/positions";

type Props = {
  position: Position;
  currentPrice?: number | null;
  positionReturn?: number | null;
  onPress?: () => void;
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
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

export function PositionCard({
  position,
  currentPrice,
  positionReturn,
  onPress,
}: Props) {
  const c = useThemeColors();
  const isBuy = position.side === "buy";

  const sideBadge = isBuy
    ? { bg: c.buyBg, text: c.buyText, label: "BUY" }
    : { bg: c.sellBg, text: c.sellText, label: "SELL" };

  const statusStyle = getStatusStyle(position.status, c);
  const borderColor = isBuy ? c.positive : c.negative;
  const capacityPct = Math.min(Math.round(position.capacity), 100);
  const capacityBarColor = isBuy ? c.positive : c.negative;

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

  return (
    <Pressable onPress={onPress}>
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
        {/* Header: symbol + side badge | status + chevron */}
        <View style={styles.headerRow}>
          <View style={styles.symbolRow}>
            <Text
              style={[
                styles.symbol,
                { color: c.textPrimary, fontFamily: typography.familyBold },
              ]}
            >
              {position.symbol}
            </Text>
            <View style={[styles.badge, { backgroundColor: sideBadge.bg }]}>
              <Text style={[styles.badgeText, { color: sideBadge.text }]}>
                {sideBadge.label}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View
              style={[styles.badge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {statusLabel(position.status)}
              </Text>
            </View>
            <ChevronRight size={16} color={c.divider} />
          </View>
        </View>

        {/* Meta: time + term */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            {timeAgo(position.timestamp)}
          </Text>
          <Text style={[styles.metaDot, { color: c.divider }]}>·</Text>
          <View style={[styles.termBadge, { backgroundColor: c.termBg }]}>
            <Text style={[styles.termText, { color: c.termText }]}>
              {termLabel(position.term)}
            </Text>
          </View>
        </View>

        {/* Data grid: 2 cols */}
        <View style={styles.dataGrid}>
          {/* Avg price */}
          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>
              AVG PRICE
            </Text>
            <Text
              style={[
                styles.dataValue,
                {
                  color: c.textPrimary,
                  fontFamily: typography.familyMedium,
                },
              ]}
            >
              {formatNumber(position.avg_price)}
            </Text>
            {position.stop_loss != null && (
              <Text style={[styles.stopLoss, { color: c.negative }]}>
                {formatNumber(position.stop_loss)}
              </Text>
            )}
          </View>

          {/* Size */}
          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>
              SIZE
            </Text>
            <Text style={[styles.dataValue, { color: c.textMuted }]}>
              {formatNumber(position.size)}
            </Text>
          </View>

          {/* Capacity — full width */}
          <View style={styles.capacityCol}>
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
                      backgroundColor: capacityBarColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.capacityPct, { color: c.textMuted }]}>
                {capacityPct}%
              </Text>
            </View>
          </View>

          {/* Current price */}
          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>
              CURRENT
            </Text>
            <Text
              style={[
                styles.dataValue,
                {
                  color: c.textPrimary,
                  fontFamily: typography.familyMedium,
                },
              ]}
            >
              {currentPrice != null ? formatNumber(currentPrice) : "—"}
            </Text>
          </View>

          {/* Return */}
          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>
              RETURN
            </Text>
            <Text
              style={[
                styles.dataValue,
                {
                  color: returnColor,
                  fontFamily: typography.familySemiBold,
                },
              ]}
            >
              {returnText}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getStatusStyle(
  status: string,
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
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 13,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
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
    fontSize: 16,
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    fontSize: 11,
  },
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
    gap: 9,
    columnGap: 10,
    marginTop: 11,
  },
  dataLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  dataValue: {
    fontSize: 13,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  stopLoss: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  capacityCol: {
    width: "100%",
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
});
