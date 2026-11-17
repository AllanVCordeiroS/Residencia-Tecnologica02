import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getTasks } from "@/services/tasks";

export function useTasksQuery() {
  return useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: getTasks,
    staleTime: 15_000,
  });
}
