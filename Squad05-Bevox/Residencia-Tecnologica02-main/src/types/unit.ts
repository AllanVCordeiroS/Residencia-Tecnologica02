import type { UnidadeOperacional } from "@/types";
import type { UnitFormValues } from "@/schemas/unit";

/** Registros antigos mantêm campos fiscais ausentes; não são inventados no adaptador. */
export type OperationalUnit = UnidadeOperacional & Partial<Omit<UnitFormValues, "nome" | "cnpj">> & {
  ativa?: boolean;
};
export type { UnitFormValues } from "@/schemas/unit";
