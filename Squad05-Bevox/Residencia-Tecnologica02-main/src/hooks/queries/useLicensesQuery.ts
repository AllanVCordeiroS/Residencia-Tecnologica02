'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createLicense, getLicenses } from '@/services/licenses';

export function useLicensesQuery() {
  return useQuery({ queryKey: queryKeys.licenses.list(), queryFn: getLicenses, staleTime: 0, refetchInterval: 60_000 });
}
export function useCreateLicenseMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createLicense, onSuccess: async () => {
    client.setQueryData(queryKeys.licenses.list(), await getLicenses());
    await client.invalidateQueries({ queryKey: queryKeys.licenses.all });
    await client.invalidateQueries({ queryKey: queryKeys.units.all });
  } });
}
