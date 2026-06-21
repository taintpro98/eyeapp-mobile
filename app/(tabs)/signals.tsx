import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { AppHeader } from "@/components/AppHeader";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { SymbolSearchBar } from "@/components/SymbolSearchBar";
import { useSignals } from "@/hooks/useSignals";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { isAccessDenied } from "@/utils/apiErrors";
import type { Signal } from "@/api/signals";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SignalsScreen() {
  const c = useThemeColors();
  const [marketId, setMarketId] = useState<1 | 2>(2);
  const [input, setInput] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSignals({
    market_id: marketId,
    symbol: symbolFilter || undefined,
  });

  function applyFilter() {
    setSymbolFilter(input.trim().toUpperCase());
  }

  const signals = data?.pages.flatMap((p) => p.items) ?? [];

  const renderSignal = ({ item }: { item: Signal }) => {
    const isBuy = item.side === "buy";
    const borderColor = isBuy ? c.positive : c.negative;
    const sideBadge = isBuy
      ? { bg: c.buyBg, text: c.buyText, label: "BUY" }
      : { bg: c.sellBg, text: c.sellText, label: "SELL" };

    return (
      <View
        style={[
          styles.signalCard,
          {
            backgroundColor: c.card,
            borderColor: c.cardBorder,
            borderLeftColor: borderColor,
          },
        ]}
      >
        <View style={styles.signalHeader}>
          <Text
            style={[
              styles.signalSymbol,
              { color: c.textPrimary, fontFamily: typography.familyBold },
            ]}
          >
            {item.symbol}
          </Text>
          <View style={[styles.badge, { backgroundColor: sideBadge.bg }]}>
            <Text style={[styles.badgeText, { color: sideBadge.text }]}>
              {sideBadge.label}
            </Text>
          </View>
        </View>
        <View style={styles.signalGrid}>
          <View>
            <Text style={[styles.gridLabel, { color: c.textFaint }]}>QTY</Text>
            <Text
              style={[styles.gridValue, { color: "#3b82f6", fontWeight: "600" }]}
            >
              {item.quantity.toFixed(2)}%
            </Text>
          </View>
          <View>
            <Text style={[styles.gridLabel, { color: c.textFaint }]}>PRICE</Text>
            <Text style={[styles.gridValue, { color: c.textPrimary }]}>
              {formatNumber(item.price)}
            </Text>
          </View>
          <View>
            <Text style={[styles.gridLabel, { color: c.textFaint }]}>TIME</Text>
            <Text style={[styles.gridValue, { color: c.textMuted }]}>
              {timeAgo(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      <AppHeader />
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: c.textPrimary, fontFamily: typography.familyBold },
            ]}
          >
            Trading signals
          </Text>
          <Pressable style={styles.refreshBtn} onPress={applyFilter}>
            <RefreshCw size={18} color={c.textMuted} />
          </Pressable>
        </View>
        <View style={styles.toggleRow}>
          <SegmentedToggle
            options={[
              { label: "Stocks", value: 2 },
              { label: "Crypto", value: 1 },
            ]}
            selected={marketId}
            onSelect={(v) => setMarketId(v as 1 | 2)}
          />
        </View>
        <SymbolSearchBar
          value={input}
          onChangeText={setInput}
          onSubmit={applyFilter}
          style={{ marginBottom: 4 }}
        />
      </View>

      {isAccessDenied(error) ? (
        <AccessDeniedState
          title="Signals bị khóa"
          hint="Nâng cấp gói của bạn để xem tín hiệu giao dịch trên thị trường này."
        />
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : (
        <FlatList
          data={signals}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSignal}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={c.brand} style={{ paddingVertical: 16 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={c.brand}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              {error ? (
                <Text style={{ color: c.negative, textAlign: "center", paddingHorizontal: 20 }}>
                  {(error as any).message ?? "Failed to load signals"}
                </Text>
              ) : (
                <Text style={{ color: c.textMuted }}>No signals found</Text>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerSection: { paddingHorizontal: 18, paddingBottom: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    marginTop: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    height: 42,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  list: { padding: 18, paddingTop: 0 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  signalCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 11,
    padding: 13,
  },
  signalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  signalSymbol: { fontSize: 17, fontWeight: "700" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  signalGrid: {
    flexDirection: "row",
    marginTop: 11,
    gap: 10,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 13,
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
});
