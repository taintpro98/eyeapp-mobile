import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/api/portfolio";
import { useAuthStore } from "@/store/authStore";

export function usePortfolio(marketId: 1 | 2) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["portfolio", marketId],
    queryFn: () => fetchPortfolio(marketId, accessToken!),
    enabled: !!accessToken,
  });
}
