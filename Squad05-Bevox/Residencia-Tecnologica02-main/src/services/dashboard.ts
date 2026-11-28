import {
  DATA_REFERENCIA_DEMO,
  alertasDemo,
  empresaDemo,
  historicoDemo,
  resumoDemo,
  unidadesDemo,
  usuarioDemo,
} from "@/data/mockData";
import type { DashboardData } from "@/types";
import { getTasks } from "@/services/tasks";

/**
 * Ponto único de acesso aos dados do dashboard.
 * Hoje devolve dados demonstrativos; para integrar a API, troque o corpo
 * desta função mantendo o contrato `DashboardData`.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const tasks = await getTasks();
  return {
    demonstrativo: true,
    dataReferencia: DATA_REFERENCIA_DEMO,
    usuario: usuarioDemo,
    empresa: empresaDemo,
    unidades: unidadesDemo,
    resumo: resumoDemo,
    historico: historicoDemo,
    tarefasRecentes: tasks.slice(0, 5).map((task) => ({
      id: String(task.id),
      titulo: task.title,
      unidade: task.unit,
      categoria: task.category,
      status: task.status === "Concluída" ? "concluida" : task.status === "A fazer" ? "pendente" : "andamento",
      prazo: task.dueDate,
      icone: "documento",
    })),
    alertas: alertasDemo,
    ultimaSincronizacao: null,
  };
}
