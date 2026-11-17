import { unidadesOperacionaisDemo } from "@/data/mockData";
import type { UnidadeOperacional } from "@/types";

/** Adaptador demonstrativo de leitura; não representa uma consulta ao banco. */
export async function getOperationalUnits(): Promise<UnidadeOperacional[]> {
  return unidadesOperacionaisDemo.map((unit) => ({ ...unit }));
}
