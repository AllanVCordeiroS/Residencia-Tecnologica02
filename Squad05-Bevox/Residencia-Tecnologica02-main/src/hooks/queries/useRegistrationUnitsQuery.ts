"use client";

import { useQuery } from "@tanstack/react-query";
import { getOperationalUnits } from "@/services/units";

export type RegistrationUnitDTO = {
  id: string;
  nome: string;
  ativa: boolean;
};

export function useRegistrationUnitsQuery() {
  return useQuery({
    queryKey: ["bevox-public", "registration", "units"] as const,
    queryFn: async (): Promise<RegistrationUnitDTO[]> => {
      // Adaptador do serviço demonstrativo existente: projeta antes de armazenar no cache.
      // Os mocks continuam no cliente; este DTO não constitui uma barreira de privacidade.
      const units = await getOperationalUnits();
      return units.map((unit) => ({ id: unit.id, nome: unit.nome, ativa: unit.ativa !== false }));
    },
    staleTime: 2 * 60_000,
  });
}
