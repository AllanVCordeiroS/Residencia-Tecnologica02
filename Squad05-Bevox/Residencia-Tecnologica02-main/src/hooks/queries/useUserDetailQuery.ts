"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getUserDetail } from "@/services/users";

export function useUserDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUserDetail(id),
    staleTime: 2 * 60_000,
  });
}
