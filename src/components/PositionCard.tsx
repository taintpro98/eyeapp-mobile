import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import type { Position, PositionLive } from "@/api/positions";

type Props = {
  position: Position;
  onPress?: () => void;
  onRefresh?: () => Promise<PositionLive>;
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatTimestamp(ts: number, days: string[]): string {
  const d = new Date(ts * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const hhmm = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return `${days[d.getDay()]} ${hhmm}`;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hhmm}`;
}

function getStatusStyle(status: string, c: ReturnType<typeof useThemeColors>) {
  switch (status) {
    case "running":   return { bg: c.statusRunningBg, text: c.statusRunningText };
    case "opened":
    case "opening":   return { bg: c.statusOpenedBg, text: c.statusOpenedText };
    case "closing":
    case "cancelling":return { bg: c.statusClosingBg, text: c.statusClosingText };
    default:          return { bg: c.statusClosedBg, text: c.statusClosedText };
  }
}

function getTermStyle(term: string) {
  return term === "short_term"
    ? { bg: "rgba(96,165,250,.18)", text: "#60a5fa" }
    : { bg: "rgba(167,139,250,.18)", text: "#a78bfa" };
}

function SpinningRefresh({
  onPress, isSpinning, color,
}: {
  onPress: () => void; isSpinning: boolean; color: string;
}) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isSpinning) {
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
  }, [isSpinning, spinValue]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <RefreshCw size={14} color={color} />
      </Animated.View>
    </Pressable>
  );
}

function LiveCell({ label, value, valueColor, c }: {
  label: string; value: string; valueColor?: string; c: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View>
      <Text style={[styles.dataLabel, { color: c.textFaint }]}>{label}</Text>
      <Text style={[styles.dataValue, { color: valueColor ?? c.textPrimary, fontFamily: typography.familySemiBold }]}>
        {value}
      </Text>
    </View>
  );
}

export function PositionCard({ position, onPress, onRefresh }: Props) {
  const c = useThemeColors();
  const { t } = useTranslation();
  const [liveData, setLiveData] = useState<PositionLive | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isBuy = position.side === "buy";
  const borderColor = isBuy ? c.positive : c.negative;
  const days: string[] = t("common.time.days", { returnObjects: true }) as string[];

  const sideBadge = {
    bg: isBuy ? c.buyBg : c.sellBg,
    text: isBuy ? c.buyText : c.sellText,
    label: t(`positionsEnum.side.${position.side}`),
  };
  const statusStyle = getStatusStyle(position.status, c);
  const termStyle = getTermStyle(position.term);

  async function handleRefresh() {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await onRefresh();
      setLiveData(data);
    } catch {
      // silently fail — keep showing stale data if any
    } finally {
      setIsRefreshing(false);
    }
  }

  // Derived live metrics
  const curPrice = liveData?.current_price ?? null;
  const unrPnl = liveData?.current_pnl ?? null;
  const posReturn = liveData?.position_return ?? null;
  const distToSl = (() => {
    if (curPrice == null || position.stop_loss == null || curPrice === 0) return null;
    const raw = isBuy
      ? (curPrice - position.stop_loss) / curPrice * 100
      : (position.stop_loss - curPrice) / curPrice * 100;
    return raw;
  })();

  const pnlColor = (v: number | null) =>
    v == null ? c.textMuted : v >= 0 ? c.positive : c.negative;

  const fmtPct = (v: number | null, decimals = 4) =>
    v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, borderLeftColor: borderColor, shadowColor: c.cardShadow }]}>

        {/* Header: symbol + side | status + refresh + chevron */}
        <View style={styles.headerRow}>
          <View style={styles.symbolRow}>
            <Text style={[styles.symbol, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
              {position.symbol}
            </Text>
            <View style={[styles.badge, { backgroundColor: sideBadge.bg }]}>
              <Text style={[styles.badgeText, { color: sideBadge.text }]}>{sideBadge.label}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {t(`positionsEnum.status.${position.status}`)}
              </Text>
            </View>
            {onRefresh && (
              <SpinningRefresh onPress={handleRefresh} isSpinning={isRefreshing} color={c.textMuted} />
            )}
            <ChevronRight size={15} color={c.divider} />
          </View>
        </View>

        {/* Meta: timestamp · term badge */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            {formatTimestamp(position.timestamp, days)}
          </Text>
          <Text style={[styles.metaDot, { color: c.divider }]}>·</Text>
          <View style={[styles.termBadge, { backgroundColor: termStyle.bg }]}>
            <Text style={[styles.termText, { color: termStyle.text }]}>
              {t(`positionsEnum.term.${position.term}`)}
            </Text>
          </View>
        </View>

        {/* Static data */}
        <View style={styles.dataGrid}>
          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>AVG PRICE</Text>
            <Text style={[styles.dataValue, { color: c.textPrimary, fontFamily: typography.familyMedium }]}>
              {formatNumber(position.avg_price)}
            </Text>
            {position.stop_loss != null && (
              <Text style={[styles.stopLoss, { color: c.negative }]}>
                {formatNumber(position.stop_loss)}
              </Text>
            )}
          </View>

          <View>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>SIZE</Text>
            <Text style={[styles.dataValue, { color: c.textMuted }]}>
              {formatNumber(position.size)}
            </Text>
          </View>

          {/* Capacity bar — full width */}
          <View style={styles.capacityCol}>
            <Text style={[styles.dataLabel, { color: c.textFaint }]}>CAPACITY</Text>
            <View style={styles.capacityRow}>
              <View style={[styles.capacityTrack, { backgroundColor: c.capacityTrackBg }]}>
                <View style={[styles.capacityFill, { width: `${Math.min(position.capacity, 100)}%`, backgroundColor: borderColor }]} />
              </View>
              <Text style={[styles.capacityPct, { color: c.textMuted }]}>
                {Math.round(position.capacity)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Live section — shown after first successful refresh */}
        {liveData && (
          <View style={[styles.liveSection, { borderTopColor: c.cardBorder }]}>
            <View style={styles.dataGrid}>
              <LiveCell
                label="CUR. PRICE"
                value={curPrice != null ? formatNumber(curPrice) : "—"}
                c={c}
              />
              <LiveCell
                label="UNR. P&L"
                value={fmtPct(unrPnl)}
                valueColor={pnlColor(unrPnl)}
                c={c}
              />
              <LiveCell
                label="P&L"
                value={fmtPct(posReturn)}
                valueColor={pnlColor(posReturn)}
                c={c}
              />
              <LiveCell
                label="DIST. TO SL"
                value={distToSl != null ? `${Math.abs(distToSl).toFixed(2)}%` : "—"}
                valueColor={distToSl != null ? c.textMuted : undefined}
                c={c}
              />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderLeftWidth: 4, borderRadius: 14, padding: 13,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  symbolRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  symbol: { fontSize: 16, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10.5, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 },
  metaText: { fontSize: 11 },
  metaDot: { fontSize: 11 },
  termBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  termText: { fontSize: 10.5, fontWeight: "600" },
  dataGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, columnGap: 24, marginTop: 11 },
  dataLabel: { fontSize: 9.5, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  dataValue: { fontSize: 13, marginTop: 2, fontVariant: ["tabular-nums"] },
  stopLoss: { fontSize: 11, fontVariant: ["tabular-nums"] },
  capacityCol: { width: "100%" },
  capacityRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 },
  capacityTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  capacityFill: { height: "100%", borderRadius: 3 },
  capacityPct: { fontSize: 10, fontVariant: ["tabular-nums"] },
  liveSection: { borderTopWidth: 1, marginTop: 11, paddingTop: 11 },
});
