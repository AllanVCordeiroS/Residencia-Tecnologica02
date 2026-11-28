"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFinanceEntries, saveFinanceEntry } from "@/services/finance";
export const financeQueryKey = ["finance", "entries"] as const;
export function useFinanceQuery() {
  return useQuery({ queryKey: financeQueryKey, queryFn: getFinanceEntries });
}
export function useFinanceMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveFinanceEntry,
    scope: { id: "finance-memory" },
    onSuccess: async () => {
      client.setQueryData(financeQueryKey, await getFinanceEntries());
      await client.invalidateQueries({ queryKey: financeQueryKey });
    },
  });
}
