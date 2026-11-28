import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createTaskDemo } from "@/services/tasks";
import type { CreateTaskInput, Task } from "@/types/task";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTaskDemo(input),
    onSuccess: async (createdTask) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (current) => [
        createdTask,
        ...(current ?? []),
      ]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview() }),
      ]);
    },
  });
}
