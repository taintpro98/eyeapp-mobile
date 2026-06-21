import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { FilterChips } from "@/components/FilterChips";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { PositionCard } from "@/components/PositionCard";
import { usePositions } from "@/hooks/usePositions";
import type { Position, PositionStatus } from "@/api/positions";

const STATUS_FILTERS = [
  { label: "All", value: "all" as const },
  { label: "Running", value: "running" as const },
  { label: "Opened", value: "opened" as const },
  { label: "Closing", value: "closing" as const },
  { label: "Closed", value: "closed" as const },
];

type FilterValue = "all" | PositionStatus;

export default function PositionsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [marketId, setMarketId] = useState<1 | 2>(2);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [activeOnly, setActiveOnly] = useState(true);

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePositions({
    market_id: marketId,
    is_active: activeOnly || undefined,
    status: filter === "all" ? undefined : filter,
  });

  const positions = data?.pages.flatMap((p) => p.items) ?? [];

  const handlePress = useCallback(
    (pos: Position) => {
      router.push({
        pathname: "/position/[id]",
        params: { id: String(pos.id), marketId: String(pos.market_id) },
      });
    },
    [router]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2.2} />
        </Pressable>
        <Text
          style={[
            styles.title,
            { color: c.textPrimary, fontFamily: typography.familyBold },
          ]}
        >
          Positions
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.headerBtn} onPress={() => refetch()}>
          <RefreshCw size={18} color={c.textMuted} />
        </Pressable>
      </View>

      {/* Market toggle */}
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

      {/* Filters */}
      <View style={styles.filterRow}>
        <FilterChips
          options={STATUS_FILTERS}
          selected={filter}
          onSelect={setFilter}
        />
        <View style={[styles.dividerVert, { borderLeftColor: c.cardBorder }]}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setActiveOnly((v) => !v)}
          >
            <View
              style={[
                styles.checkbox,
                activeOnly
                  ? { backgroundColor: c.brand }
                  : { borderWidth: 1.5, borderColor: c.cardBorder },
              ]}
            >
              {activeOnly && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: c.textMuted }]}>
              Active
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : (
        <FlatList
          data={positions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
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
          renderItem={({ item }) => (
            <PositionCard
              position={item}
              onPress={() => handlePress(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: c.textMuted }}>No positions found</Text>
            </View>
          }
        />
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
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    paddingBottom: 12,
  },
  dividerVert: {
    borderLeftWidth: 1,
    marginLeft: 11,
    paddingLeft: 11,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginTop: -1,
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  toggleRow: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    alignSelf: "flex-start",
    marginLeft: 14,
  },
  list: {
    padding: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
});
