import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { fetchOnboardingMarkets, fetchUserMarkets, subscribeFreeMarket } from "@/api/markets";
import type { Market } from "@/api/markets";
import { AuthLogo } from "@/components/AuthLogo";

const BG = "#18181B";
const CARD = "#27272A";
const BORDER = "#3F3F46";
const TEXT = "#FAFAFA";
const MUTED = "#A1A1AA";
const BRAND = "#8B5FBF";
const BRAND_DIM = "rgba(139,95,191,0.15)";

function formatFeature(code: string): string {
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [checking, setChecking] = useState(true);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      router.replace("/(auth)/sign-in");
      return;
    }

    async function init() {
      try {
        const [userMarkets, allMarkets] = await Promise.all([
          fetchUserMarkets(accessToken!),
          fetchOnboardingMarkets(),
        ]);
        if (userMarkets.length > 0) {
          router.replace("/(tabs)");
          return;
        }
        setMarkets(allMarkets);
      } catch {
        router.replace("/(tabs)");
      } finally {
        setChecking(false);
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(market: Market) {
    if (!accessToken) return;
    setSubscribing(market.market_id);
    setError("");
    try {
      await subscribeFreeMarket(market.market_id, accessToken);
      router.replace("/(tabs)");
    } catch {
      setError(t("onboarding.error"));
      setSubscribing(null);
    }
  }

  if (checking) {
    return (
      <View style={[styles.bg, styles.centered]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <AuthLogo subtitle={t("onboarding.subtitle")} />

          <View style={styles.headerBlock}>
            <Text style={styles.title}>{t("onboarding.title")}</Text>
            <Text style={styles.subtitle}>{t("onboarding.description")}</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.cards}>
            {markets.map((market) => (
              <MarketCard
                key={market.market_id}
                market={market}
                onSelect={() => handleSelect(market)}
                loading={subscribing === market.market_id}
                disabled={subscribing !== null}
                t={t}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MarketCard({
  market,
  onSelect,
  loading,
  disabled,
  t,
}: {
  market: Market;
  onSelect: () => void;
  loading: boolean;
  disabled: boolean;
  t: (key: string) => string;
}) {
  const freePlan = market.plans.find((p) => p.code === "free");
  if (!freePlan) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{market.name}</Text>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>{t("onboarding.free")}</Text>
        </View>
      </View>

      <View style={styles.featureList}>
        {freePlan.features.map((code) => (
          <View key={code} style={styles.featureRow}>
            <Check size={15} color={BRAND} strokeWidth={2.5} />
            <Text style={styles.featureText}>{formatFeature(code)}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.button, (disabled || loading) && { opacity: 0.7 }]}
        onPress={onSelect}
        disabled={disabled}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t("onboarding.startFree")}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  headerBlock: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
  },
  cards: {
    gap: 14,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "600",
    color: TEXT,
  },
  freeBadge: {
    backgroundColor: BRAND_DIM,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  freeBadgeText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "600",
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: TEXT,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
