import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/dashboard";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardData,
    staleTime: 60_000,
  });
}
