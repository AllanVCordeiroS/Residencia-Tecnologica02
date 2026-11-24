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

export function verificarExclusaoUnidade(
  unidade: UnidadeOperacional,
  documentos: LegalDocument[],
  tarefas: Task[]
) {
  const documentosPendentes = documentos.filter(
    (d) => mesmaUnidade(d.unit, unidade.nome) && STATUS_DOCUMENTO_BLOQUEANTE.includes(d.status)
  ).length;

  const tarefasEmAndamento = tarefas.filter(
    (t) => mesmaUnidade(t.unit, unidade.nome) && STATUS_TAREFA_BLOQUEANTE.includes(t.status)
  ).length;

  const permitido = documentosPendentes === 0 && tarefasEmAndamento === 0;

  return {
    permitido,
    mensagem: permitido ? null : MENSAGEM_BLOQUEIO,
    documentosPendentes,
    tarefasEmAndamento,
  };
}
