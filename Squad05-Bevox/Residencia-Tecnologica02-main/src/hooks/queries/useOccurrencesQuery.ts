import { useQuery } from "@tanstack/react-query";
import { occurrenceQueryKeys } from "@/lib/occurrence-query-keys";
import { getOccurrences } from "@/services/occurrences";

export function useOccurrencesQuery() {
  return useQuery({
    queryKey: occurrenceQueryKeys.list(),
    queryFn: getOccurrences,
    staleTime: 15_000,
  });
}
