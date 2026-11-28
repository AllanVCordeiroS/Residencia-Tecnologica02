"use client";

import { useIsMutating, useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { deleteUserDemo, getUserDetail, getUsers, saveUserDemo, toggleUserStatusDemo } from "@/services/users";
import type { UserFormValues } from "@/schemas/user";

export function useUserSaveSucceeded() {
  return useMutationState({
    filters: { mutationKey: [...queryKeys.users.all, "save"], status: "success" },
    select: (mutation) => mutation.state.submittedAt,
  }).length > 0;
}

export function useSaveUserMutation(id?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: [...queryKeys.users.all, "save"],
    scope: { id: "users-demo" },
    mutationFn: (values: UserFormValues) => saveUserDemo(values, id),
    onMutate: () => client.cancelQueries({ queryKey: queryKeys.users.all }),
    onSuccess: async (user) => {
      const [users, detail] = await Promise.all([getUsers(), getUserDetail(user.id)]);
      client.setQueryData(queryKeys.users.lists(), users);
      client.setQueryData(queryKeys.users.detail(user.id), detail);
      await client.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUserActionsPending() {
  return useIsMutating({ mutationKey: queryKeys.users.all }) > 0;
}

export function useUsersQuery() {
  return useQuery({ queryKey: queryKeys.users.lists(), queryFn: getUsers });
}

export function useUserActionMutation(action: "toggle" | "delete") {
  const client = useQueryClient();
  return useMutation({
    mutationKey: [...queryKeys.users.all, action],
    scope: { id: "users-demo" },
    mutationFn: action === "toggle" ? toggleUserStatusDemo : deleteUserDemo,
    onMutate: async () => {
      await client.cancelQueries({ queryKey: queryKeys.users.all });
    },
    onSuccess: async (_, id) => {
      // Atualiza também detalhes inativos no cache, sem aguardar uma nova visita.
      const [users, detail] = await Promise.all([getUsers(), getUserDetail(id)]);
      client.setQueryData(queryKeys.users.lists(), users);
      client.setQueryData(queryKeys.users.detail(id), detail);
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.users.lists() }),
        client.invalidateQueries({ queryKey: queryKeys.users.detail(id) }),
      ]);
    },
  });
}
