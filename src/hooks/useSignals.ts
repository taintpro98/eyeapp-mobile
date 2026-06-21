import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSignals, type SignalsParams } from "@/api/signals";
import { useAuthStore } from "@/store/authStore";

const PAGE_SIZE = 15;

export function useSignals(params: Omit<SignalsParams, "limit" | "offset">) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useInfiniteQuery({
    queryKey: ["signals", params],
    queryFn: ({ pageParam = 0 }) =>
      fetchSignals(
        { ...params, limit: PAGE_SIZE, offset: pageParam },
        accessToken!
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });
}
