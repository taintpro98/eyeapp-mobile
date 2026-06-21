import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchPositions,
  fetchPositionDetail,
  fetchPositionLive,
  type PositionsParams,
} from "@/api/positions";
import { useAuthStore } from "@/store/authStore";

const PAGE_SIZE = 15;

export function usePositions(
  params: Omit<PositionsParams, "limit" | "offset">
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useInfiniteQuery({
    queryKey: ["positions", params],
    queryFn: ({ pageParam = 0 }) =>
      fetchPositions(
        { ...params, limit: PAGE_SIZE, offset: pageParam },
        accessToken!
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: !!accessToken,
  });
}

export function usePositionDetail(marketId: 1 | 2, positionId: number) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["position-detail", marketId, positionId],
    queryFn: () => fetchPositionDetail(marketId, positionId, accessToken!),
    enabled: !!accessToken && positionId > 0,
  });
}

export function usePositionLive(marketId: 1 | 2, positionId: number) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["position-live", marketId, positionId],
    queryFn: () => fetchPositionLive(marketId, positionId, accessToken!),
    enabled: !!accessToken && positionId > 0,
    refetchInterval: 15_000,
  });
}
