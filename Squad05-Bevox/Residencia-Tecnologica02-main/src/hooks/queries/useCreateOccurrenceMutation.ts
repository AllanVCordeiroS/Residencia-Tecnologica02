import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { occurrenceQueryKeys } from "@/lib/occurrence-query-keys";
import { createOccurrenceDemo } from "@/services/occurrences";
import type { CreateOccurrenceInput, Occurrence } from "@/types/occurrence";

export function useCreateOccurrenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOccurrenceInput) => createOccurrenceDemo(input),
    onSuccess: async (createdOccurrence) => {
      queryClient.setQueryData<Occurrence[]>(occurrenceQueryKeys.list(), (current) => [
        createdOccurrence,
        ...(current ?? []),
      ]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: occurrenceQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.operations.overview() }),
      ]);
    },
  });
}
