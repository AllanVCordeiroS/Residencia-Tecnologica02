"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { deleteUnitDemo, getOperationalUnits, saveUnitDemo, toggleUnitDemo } from "@/services/units";
import type { UnitFormValues } from "@/types/unit";

export function useUnitsQuery() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: getOperationalUnits,
    staleTime: 2 * 60_000,
  });
}

export function useUnitMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.units.all,
    scope: { id: "units-demo" },
    mutationFn: async (action: { type: "save"; values: UnitFormValues; id?: string } | { type: "toggle" | "delete"; id: string }) => {
      if (action.type === "save") return saveUnitDemo(action.values, action.id);
      if (action.type === "toggle") return toggleUnitDemo(action.id);
      return deleteUnitDemo(action.id);
    },
    onMutate: () => client.cancelQueries({ queryKey: queryKeys.units.all }),
    onSuccess: async () => {
      client.setQueryData(queryKeys.units.list(), await getOperationalUnits());
      await client.invalidateQueries({ queryKey: queryKeys.units.all });
    },
  });
}
