import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { useAuthStore } from "@/store/authStore";
import { fetchAnalysis } from "@/api/analysis";
import { fetchSignals } from "@/api/signals";
import { fetchPositions } from "@/api/positions";
import { isAccessDenied } from "@/utils/apiErrors";
import type { AnalysisResult, TrendData } from "@/api/analysis";
import type { Signal } from "@/api/signals";
import type { Position } from "@/api/positions";

const SIGNALS_PAGE_SIZE = 5;

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function ratingColor(rating: string, positive: string, warning: string, negative: string) {
  if (rating === "A" || rating === "B+") return positive;
  if (rating === "B" || rating === "C") return warning;
  return negative;
}

export default function AnalyticsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [marketId, setMarketId] = useState<1 | 2>(2);
  const [input, setInput] = useState("");
  const [symbol, setSymbol] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalsTotal, setSignalsTotal] = useState(0);
  const [signalsPage, setSignalsPage] = useState(0);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsDenied, setSignalsDenied] = useState(false);

  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsDenied, setPositionsDenied] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadAnalysis = useCallback(async (sym: string, mId: 1 | 2) => {
    setAnalysisLoading(true);
    setAnalysisError(false);
    setAnalysis(null);
    try {
      const res = await fetchAnalysis(mId, sym);
      if (mountedRef.current) setAnalysis(res);
    } catch {
      if (mountedRef.current) setAnalysisError(true);
    } finally {
      if (mountedRef.current) setAnalysisLoading(false);
    }
  }, []);

  const loadSignals = useCallback(async (sym: string, mId: 1 | 2, page: number) => {
    if (!accessToken) return;
    setSignalsLoading(true);
    setSignalsDenied(false);
    try {
      const res = await fetchSignals(
        { market_id: mId, limit: SIGNALS_PAGE_SIZE, offset: page * SIGNALS_PAGE_SIZE, symbol: sym },
        accessToken
      );
      if (mountedRef.current) {
        setSignals(res.items);
        setSignalsTotal(res.total);
      }
    } catch (err) {
      if (mountedRef.current) {
        if (isAccessDenied(err)) setSignalsDenied(true);
        setSignals([]);
      }
    } finally {
      if (mountedRef.current) setSignalsLoading(false);
    }
  }, [accessToken]);

  const loadPositions = useCallback(async (sym: string, mId: 1 | 2) => {
    if (!accessToken) return;
    setPositionsLoading(true);
    setPositionsDenied(false);
    try {
      const res = await fetchPositions(
        { market_id: mId, limit: 10, symbol: sym, is_active: true },
        accessToken
      );
      if (mountedRef.current) setPositions(res.items);
    } catch (err) {
      if (mountedRef.current) {
        if (isAccessDenied(err)) setPositionsDenied(true);
        setPositions([]);
      }
    } finally {
      if (mountedRef.current) setPositionsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!symbol) return;
    setSignalsPage(0);
    loadAnalysis(symbol, marketId);
    loadPositions(symbol, marketId);
  }, [symbol, marketId, loadAnalysis, loadPositions]);

  useEffect(() => {
    if (!symbol) return;
    loadSignals(symbol, marketId, signalsPage);
  }, [symbol, marketId, signalsPage, loadSignals]);

  function handleSearch() {
    const q = input.trim().toUpperCase();
    if (!q) return;
    setSymbol(q);
  }

  const signalsTotalPages = Math.ceil(signalsTotal / SIGNALS_PAGE_SIZE) || 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.title, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
          Asset Analysis
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Market toggle */}
        <SegmentedToggle
          options={[{ label: "Stocks", value: 2 }, { label: "Crypto", value: 1 }]}
          selected={marketId}
          onSelect={(v) => { setMarketId(v as 1 | 2); setSymbol(null); setInput(""); }}
        />

        {/* Search bar */}
        <View style={[styles.searchRow, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <Search size={16} color={c.textFaint} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: c.textPrimary }]}
            placeholder={marketId === 2 ? "e.g. VNM, HPG, SSI" : "e.g. BTCUSDT, ETHUSDT"}
            placeholderTextColor={c.textFaint}
            value={input}
            onChangeText={setInput}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={[styles.searchBtn, { backgroundColor: c.brand }]}
            onPress={handleSearch}
          >
            <Text style={styles.searchBtnText}>Tìm</Text>
          </Pressable>
        </View>

        {!symbol ? (
          <View style={styles.emptyState}>
            <Search size={40} color={c.textFaint} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              Nhập mã chứng khoán để phân tích
            </Text>
          </View>
        ) : (
          <View style={styles.sections}>
            {/* Asset header card */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <View style={styles.assetHeaderRow}>
                <View>
                  <Text style={[styles.assetSymbol, { color: c.textPrimary, fontFamily: typography.familyBold }]}>
                    {symbol}
                  </Text>
                  {analysis?.name ? (
                    <Text style={[styles.assetName, { color: c.textMuted }]}>{analysis.name}</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {analysisLoading ? (
                    <ActivityIndicator color={c.brand} />
                  ) : analysis ? (
                    <>
                      <Text style={[styles.livePrice, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                        {fmt(analysis.live_price)}
                      </Text>
                      <Text style={[styles.livePriceLabel, { color: c.textFaint }]}>Live price</Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Trend Analysis */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                Phân tích xu hướng
              </Text>
              {analysisLoading ? (
                <View style={styles.centered}>
                  <ActivityIndicator color={c.brand} />
                </View>
              ) : !analysis || analysisError ? (
                <Text style={[styles.emptySection, { color: c.textMuted }]}>
                  {analysisError ? "Không tìm thấy dữ liệu phân tích." : "Đang tải…"}
                </Text>
              ) : (
                <View style={styles.trendContent}>
                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <Text style={[styles.ratingLabel, { color: c.textMuted }]}>Xếp hạng</Text>
                    <View style={[
                      styles.ratingBadge,
                      { backgroundColor: ratingColor(analysis.rating, "rgba(34,197,94,0.15)", "rgba(245,158,11,0.15)", "rgba(239,68,68,0.15)") }
                    ]}>
                      <Text style={[
                        styles.ratingText,
                        { color: ratingColor(analysis.rating, "#22c55e", "#f59e0b", "#ef4444") }
                      ]}>
                        {analysis.rating}
                      </Text>
                    </View>
                  </View>
                  {/* Mid + Short term */}
                  <View style={styles.trendGrid}>
                    <TrendCard label="Mid-term" data={analysis.mid_term} colors={c} />
                    <TrendCard label="Short-term" data={analysis.short_term} colors={c} />
                  </View>
                </View>
              )}
            </View>

            {/* Signals */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                Signals — {symbol}
              </Text>
              {signalsDenied ? (
                <AccessDeniedState
                  title="Signals bị khóa"
                  hint="Nâng cấp để xem tín hiệu giao dịch."
                />
              ) : signalsLoading ? (
                <View style={styles.centered}><ActivityIndicator color={c.brand} /></View>
              ) : signals.length === 0 ? (
                <Text style={[styles.emptySection, { color: c.textMuted }]}>Không có signal nào.</Text>
              ) : (
                <View>
                  {signals.map((sig) => (
                    <SignalRow key={sig.id} signal={sig} colors={c} />
                  ))}
                  {signalsTotal > SIGNALS_PAGE_SIZE && (
                    <View style={styles.pagination}>
                      <Pressable
                        style={[styles.pageBtn, { borderColor: c.cardBorder }, signalsPage === 0 && { opacity: 0.4 }]}
                        onPress={() => setSignalsPage((p) => Math.max(0, p - 1))}
                        disabled={signalsPage === 0}
                      >
                        <ChevronLeft size={16} color={c.textMuted} />
                      </Pressable>
                      <Text style={[styles.pageText, { color: c.textMuted }]}>
                        {signalsPage + 1} / {signalsTotalPages}
                      </Text>
                      <Pressable
                        style={[styles.pageBtn, { borderColor: c.cardBorder }, signalsPage >= signalsTotalPages - 1 && { opacity: 0.4 }]}
                        onPress={() => setSignalsPage((p) => Math.min(signalsTotalPages - 1, p + 1))}
                        disabled={signalsPage >= signalsTotalPages - 1}
                      >
                        <ChevronRight size={16} color={c.textMuted} />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Active Positions */}
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}>
                Vị thế đang mở — {symbol}
              </Text>
              {positionsDenied ? (
                <AccessDeniedState
                  title="Positions bị khóa"
                  hint="Nâng cấp để xem vị thế giao dịch."
                />
              ) : positionsLoading ? (
                <View style={styles.centered}><ActivityIndicator color={c.brand} /></View>
              ) : positions.length === 0 ? (
                <Text style={[styles.emptySection, { color: c.textMuted }]}>Không có vị thế nào đang mở.</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {positions.map((pos) => (
                    <PositionRow
                      key={pos.id}
                      position={pos}
                      colors={c}
                      onPress={() =>
                        router.push({
                          pathname: "/position/[id]",
                          params: { id: String(pos.id), marketId: String(pos.market_id) },
                        })
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TrendCard({
  label,
  data,
  colors: c,
}: {
  label: string;
  data: TrendData;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const trendColor =
    data.trend === "uptrend" ? "#22c55e" : data.trend === "downtrend" ? "#ef4444" : c.textMuted;
  const signalColor =
    data.signal === "bullish" ? "#22c55e" : data.signal === "bearish" ? "#ef4444" : c.textMuted;

  const TrendIcon =
    data.trend === "uptrend" ? TrendingUp : data.trend === "downtrend" ? TrendingDown : Minus;

  const trendLabel =
    data.trend === "uptrend" ? "Tăng" : data.trend === "downtrend" ? "Giảm" : "Đi ngang";
  const signalLabel =
    data.signal === "bullish" ? "Tăng giá" : data.signal === "bearish" ? "Giảm giá" : "Trung tính";
  const strengthLabel =
    data.strength === "strong" ? "Mạnh" : data.strength === "moderate" ? "Trung bình" : "Yếu";

  return (
    <View style={[styles.trendCard, { backgroundColor: `${c.brand}08`, borderColor: c.cardBorder }]}>
      <Text style={[styles.trendCardLabel, { color: c.textFaint }]}>{label}</Text>
      <View style={styles.trendRow}>
        <TrendIcon size={16} color={trendColor} strokeWidth={2} />
        <Text style={[styles.trendValue, { color: trendColor }]}>{trendLabel}</Text>
      </View>
      <View style={styles.trendStats}>
        <View>
          <Text style={[styles.statLabel, { color: c.textFaint }]}>SIGNAL</Text>
          <Text style={[styles.statValue, { color: signalColor }]}>{signalLabel}</Text>
        </View>
        <View>
          <Text style={[styles.statLabel, { color: c.textFaint }]}>STRENGTH</Text>
          <Text style={[styles.statValue, { color: c.textPrimary }]}>{strengthLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function SignalRow({
  signal: sig,
  colors: c,
}: {
  signal: Signal;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const isBuy = sig.side === "buy";
  const borderColor = isBuy ? "#22c55e" : "#ef4444";
  const badgeBg = isBuy ? c.buyBg : c.sellBg;
  const badgeText = isBuy ? c.buyText : c.sellText;

  return (
    <View style={[styles.signalRow, { borderLeftColor: borderColor, backgroundColor: `${c.brand}06` }]}>
      <View style={styles.signalLeft}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeText }]}>{sig.side.toUpperCase()}</Text>
        </View>
        <Text style={[styles.signalPrice, { color: c.textPrimary }]}>{fmt(sig.price)}</Text>
        <Text style={[styles.signalQty, { color: "#3b82f6" }]}>{sig.quantity.toFixed(2)}%</Text>
      </View>
      <Text style={[styles.signalTime, { color: c.textMuted }]}>{timeAgo(sig.timestamp)}</Text>
    </View>
  );
}

function PositionRow({
  position: p,
  colors: c,
  onPress,
}: {
  position: Position;
  colors: ReturnType<typeof useThemeColors>;
  onPress: () => void;
}) {
  const isBuy = p.side === "buy";
  const borderColor = isBuy ? "#22c55e" : "#ef4444";
  const capacityPct = Math.min(Math.round(p.capacity), 100);

  return (
    <Pressable
      style={[styles.positionCard, { borderColor: c.cardBorder, borderLeftColor: borderColor, backgroundColor: c.surface }]}
      onPress={onPress}
    >
      <View style={styles.positionHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isBuy ? c.buyBg : c.sellBg }]}>
            <Text style={[styles.badgeText, { color: isBuy ? c.buyText : c.sellText }]}>
              {p.side.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: c.termBg }]}>
            <Text style={[styles.badgeText, { color: c.termText }]}>
              {p.term === "short_term" ? "Intraday" : "Swing"}
            </Text>
          </View>
        </View>
        <Text style={[styles.signalTime, { color: c.textMuted }]}>{timeAgo(p.timestamp)}</Text>
      </View>
      <View style={styles.positionStats}>
        <View>
          <Text style={[styles.statLabel, { color: c.textFaint }]}>AVG PRICE</Text>
          <Text style={[styles.statValue, { color: c.textPrimary }]}>{fmt(p.avg_price)}</Text>
        </View>
        <View>
          <Text style={[styles.statLabel, { color: c.textFaint }]}>STOP LOSS</Text>
          <Text style={[styles.statValue, { color: p.stop_loss != null ? "#ef4444" : c.textMuted }]}>
            {p.stop_loss != null ? fmt(p.stop_loss) : "—"}
          </Text>
        </View>
        <View>
          <Text style={[styles.statLabel, { color: c.textFaint }]}>CAPACITY</Text>
          <Text style={[styles.statValue, { color: c.textPrimary }]}>{capacityPct}%</Text>
        </View>
      </View>
    </Pressable>
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
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: -0.2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  searchBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  searchBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    gap: 14,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  sections: { gap: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
  },
  assetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assetSymbol: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  assetName: { fontSize: 13, marginTop: 2 },
  livePrice: { fontSize: 20, fontWeight: "600" },
  livePriceLabel: { fontSize: 10, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 14 },
  centered: { paddingVertical: 20, alignItems: "center" },
  emptySection: { fontSize: 13, textAlign: "center", paddingVertical: 16 },
  trendContent: { gap: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingLabel: { fontSize: 13 },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ratingText: { fontSize: 16, fontWeight: "700" },
  trendGrid: { flexDirection: "row", gap: 10 },
  trendCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  trendCardLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trendValue: { fontSize: 14, fontWeight: "600" },
  trendStats: { flexDirection: "row", gap: 16, marginTop: 4 },
  statLabel: { fontSize: 9.5, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 13, marginTop: 2, fontWeight: "500" },
  signalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  signalLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  signalPrice: { fontSize: 13, fontWeight: "500", fontVariant: ["tabular-nums"] },
  signalQty: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  signalTime: { fontSize: 11 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10.5, fontWeight: "600" },
  badgeRow: { flexDirection: "row", gap: 6 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pageText: { fontSize: 13 },
  positionCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
  },
  positionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  positionStats: { flexDirection: "row", gap: 20 },
});
