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
