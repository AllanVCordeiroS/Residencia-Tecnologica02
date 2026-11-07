import { DADOS_MOCK } from "@/data/mockOperacional";
import type { DadosOperacionais } from "@/types/operacional";

/**
 * >>> PONTO DE INTEGRAÇÃO COM O BANCO DE DADOS <<<
 *
 * A Central de Operações só depende desta função. Para integrar, basta
 * trocar o corpo por uma consulta ao banco (ou uma chamada de API) que
 * devolva o mesmo formato de `DadosOperacionais` (veja src/types/operacional.ts).
 * Telas e cálculos não precisam mudar.
 *
 * Hoje ela devolve dados FICTÍCIOS.
 */
export async function obterDadosOperacionais(): Promise<DadosOperacionais> {
  return DADOS_MOCK;
}