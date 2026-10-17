import {
  DATA_REFERENCIA_DEMO,
  alertasDemo,
  empresaDemo,
  historicoDemo,
  resumoDemo,
  tarefasRecentesDemo,
  unidadesDemo,
  usuarioDemo,
} from "@/data/mockData";
import type { DashboardData } from "@/types";

/**
 * Ponto único de acesso aos dados do dashboard.
 * Hoje devolve dados demonstrativos; para integrar a API, troque o corpo
 * desta função mantendo o contrato `DashboardData`.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return {
    demonstrativo: true,
    dataReferencia: DATA_REFERENCIA_DEMO,
    usuario: usuarioDemo,
    empresa: empresaDemo,
    unidades: unidadesDemo,
    resumo: resumoDemo,
    historico: historicoDemo,
    tarefasRecentes: tarefasRecentesDemo,
    alertas: alertasDemo,
    ultimaSincronizacao: null,
  };
}
