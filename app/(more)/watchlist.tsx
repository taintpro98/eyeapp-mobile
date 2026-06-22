import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAccessibleMarketIds } from "@/hooks/useMarkets";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { isAccessDenied } from "@/utils/apiErrors";
import type { WatchlistItem } from "@/api/watchlist";

export default function WatchlistScreen() {
  const { t } = useTranslation();
  const c = useThemeColors();
  const router = useRouter();
  const accessibleMarkets = useAccessibleMarketIds();
  const [marketId, setMarketId] = useState<1 | 2>(2);
  const { data, isLoading, error, refetch, isRefetching } = useWatchlist(marketId);

  const renderItem = ({ item, index }: { item: WatchlistItem; index: number }) => (
    <View>
      <View style={styles.row}>
        <View>
          <Text
            style={[
              styles.symbol,
              { color: c.textPrimary, fontFamily: typography.familySemiBold },
            ]}
          >
            {item.symbol}
          </Text>
          {item.name && (
            <Text style={[styles.name, { color: c.textMuted }]}>{item.name}</Text>
          )}
        </View>
        <Text
          style={[
            styles.price,
            { color: c.textPrimary, fontFamily: typography.familySemiBold },
          ]}
        >
          {item.latest_price?.toLocaleString("en-US") ?? "—"}
        </Text>
      </View>
      {data && index < data.items.length - 1 && (
        <View style={[styles.divider, { backgroundColor: c.divider }]} />
      )}
    </View>
  );

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
          {t("watchlist.title")}
        </Text>
      </View>
      <View style={styles.toggleRow}>
        <SegmentedToggle
          options={[
            { label: t("market.stocks"), value: 2, locked: accessibleMarkets.size > 0 && !accessibleMarkets.has(2) },
            { label: t("market.crypto"), value: 1, locked: accessibleMarkets.size > 0 && !accessibleMarkets.has(1) },
          ]}
          selected={marketId}
          onSelect={(v) => setMarketId(v as 1 | 2)}
        />
      </View>
      {isAccessDenied(error) ? (
        <AccessDeniedState
          title={t("watchlist.accessDenied")}
          hint={t("watchlist.accessDeniedHint")}
        />
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={c.brand} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: c.textMuted }}>{t("watchlist.empty")}</Text>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: -0.2 },
  toggleRow: { paddingHorizontal: 14, paddingBottom: 6, alignSelf: "flex-start" },
  list: { padding: 18 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  symbol: { fontSize: 14, fontWeight: "600" },
  name: { fontSize: 11, marginTop: 1 },
  price: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  divider: { height: 1 },
});
