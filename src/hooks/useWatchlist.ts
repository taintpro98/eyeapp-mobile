import { useQuery } from "@tanstack/react-query";
import { fetchWatchlist } from "@/api/watchlist";
import { useAuthStore } from "@/store/authStore";

export function useWatchlist(marketId: 1 | 2) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["watchlist", marketId],
    queryFn: () => fetchWatchlist(marketId, accessToken!),
    enabled: !!accessToken,
  });
}
