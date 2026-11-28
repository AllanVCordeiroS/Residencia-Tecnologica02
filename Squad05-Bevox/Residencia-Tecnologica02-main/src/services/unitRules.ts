import type { LegalDocument } from "@/types/document";
import type { Task } from "@/types/task";
import type { UnidadeOperacional } from "@/types";

export const MENSAGEM_BLOQUEIO =
  "Não é possível excluir esta unidade, pois existem documentos pendentes ou tarefas em andamento vinculadas a ela.";

const STATUS_DOCUMENTO_BLOQUEANTE: LegalDocument["status"][] = ["Pendente", "Em análise"];
const STATUS_TAREFA_BLOQUEANTE: Task["status"][] = ["Em andamento", "Em revisão"];

// Padroniza o nome para comparar: sem acento, sem travessões, sem "unidade"
function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[–—-]/g, " ")
    .replace(/\bunidade\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mesmaUnidade(a: string, b: string): boolean {
  return normalizarNome(a) === normalizarNome(b);
}

export function mesmaIdentidade(value: string, unit: UnidadeOperacional): boolean {
  return value === unit.id || mesmaUnidade(value, unit.nome);
}

export function verificarExclusaoUnidade(
  unidade: UnidadeOperacional,
  documentos: LegalDocument[],
  tarefas: Task[]
) {
  const documentosPendentes = documentos.filter(
    (d) => mesmaIdentidade(d.unit, unidade) && STATUS_DOCUMENTO_BLOQUEANTE.includes(d.status)
  ).length;

  const tarefasEmAndamento = tarefas.filter(
    (t) => mesmaIdentidade(t.unit, unidade) && (STATUS_TAREFA_BLOQUEANTE.includes(t.status) || t.status === "A fazer")
  ).length;

  const possuiVinculos = documentos.some((d) => mesmaIdentidade(d.unit, unidade)) || tarefas.some((t) => mesmaIdentidade(t.unit, unidade));
  const possuiPendencias = unidade.documentosPendentes > 0 || unidade.tarefasAtrasadas > 0 || unidade.licencasVencendo > 0;
  const permitido = documentosPendentes === 0 && tarefasEmAndamento === 0 && !possuiPendencias && !possuiVinculos;

  return {
    permitido,
    mensagem: permitido ? null : possuiVinculos && documentosPendentes === 0 && tarefasEmAndamento === 0 && !possuiPendencias ? "Não é possível excluir uma unidade com documentos ou tarefas vinculados. Preserve o histórico desativando a unidade." : MENSAGEM_BLOQUEIO,
    documentosPendentes,
    tarefasEmAndamento,
  };
}
