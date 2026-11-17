import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getOperationalUnits } from "@/services/units";

export function useUnitsQuery() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: getOperationalUnits,
    staleTime: 2 * 60_000,
  });
}
