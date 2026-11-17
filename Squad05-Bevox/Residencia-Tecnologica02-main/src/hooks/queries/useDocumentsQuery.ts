import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getDocuments } from "@/services/documents";

export function useDocumentsQuery() {
  return useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: getDocuments,
    staleTime: 5 * 60_000,
  });
}
