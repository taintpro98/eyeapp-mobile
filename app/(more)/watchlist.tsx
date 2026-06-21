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
import { ChevronLeft } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import { isAccessDenied } from "@/utils/apiErrors";
import type { WatchlistItem } from "@/api/watchlist";

export default function WatchlistScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useWatchlist(1);

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
          Watchlist
        </Text>
      </View>
      {isAccessDenied(error) ? (
        <AccessDeniedState
          title="Watchlist bị khóa"
          hint="Nâng cấp gói của bạn để theo dõi tài sản trên thị trường này."
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
              <Text style={{ color: c.textMuted }}>No items in watchlist</Text>
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
