import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMarkets, fetchUserMarkets } from "@/api/markets";
import { useAuthStore } from "@/store/authStore";

export function useAllMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchAllMarkets,
  });
}

export function useUserMarkets() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["user-markets"],
    queryFn: () => fetchUserMarkets(accessToken!),
    enabled: !!accessToken,
  });
}

export function useAccessibleMarketIds(): Set<number> {
  const { data: allMarkets } = useAllMarkets();
  const { data: userMarkets } = useUserMarkets();

  return useMemo(() => {
    if (!allMarkets || !userMarkets) return new Set<number>();
    const userCodes = new Set(userMarkets.map((m) => m.code));
    return new Set(
      allMarkets.filter((m) => userCodes.has(m.code)).map((m) => m.market_id)
    );
  }, [allMarkets, userMarkets]);
}
