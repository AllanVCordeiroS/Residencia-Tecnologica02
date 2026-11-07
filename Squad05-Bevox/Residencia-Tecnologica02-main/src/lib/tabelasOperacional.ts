import type {
  DadosOperacionais,
  FiltroUnidade,
  Prioridade,
  StatusOcorrencia,
  StatusTarefa,
  UnidadeId,
} from "@/types/operacional";

export type AbaTabela = "tarefas" | "ocorrencias";
export type FiltroTabela = "todos" | "atrasadas" | "manutencao" | "aguardando";
export type TipoLinha = "rotina" | "tarefa" | "manutencao" | "ocorrencia";
export type TomStatus =
  | "azul"
  | "cinza"
  | "indigo"
  | "vermelho"
  | "roxo"
  | "verde";

export interface LinhaTabela {
  id: string;
  tipo: TipoLinha;
  descricao: string;
  unidade: string;
  responsavel: string;
  prazo: string; // AAAA-MM-DD
  status: { rotulo: string; tom: TomStatus };
  prioridade: Prioridade;
}

export const ROTULO_FILTRO: Record<FiltroTabela, string> = {
  todos: "Todos",
  atrasadas: "Rotinas atrasadas",
  manutencao: "Manutenções pendentes",
  aguardando: "Ocorrências aguardando providências",
};

const STATUS_TAREFA: Record<StatusTarefa, { rotulo: string; tom: TomStatus }> = {
  atrasada: { rotulo: "Atrasada", tom: "vermelho" },
  em_andamento: { rotulo: "Em andamento", tom: "azul" },
  pendente: { rotulo: "Pendente", tom: "cinza" },
  a_fazer: { rotulo: "A fazer", tom: "indigo" },
  concluida: { rotulo: "Concluída", tom: "verde" },
};

const STATUS_OCORRENCIA: Record<
  StatusOcorrencia,
  { rotulo: string; tom: TomStatus }
> = {
  aberta: { rotulo: "Aberta", tom: "vermelho" },
  em_analise: { rotulo: "Em análise", tom: "roxo" },
  em_andamento: { rotulo: "Em andamento", tom: "azul" },
  resolvida: { rotulo: "Resolvida", tom: "verde" },
};

// Mais urgente primeiro: prazo mais próximo, e o código para desempatar.
function ordenar(a: LinhaTabela, b: LinhaTabela): number {
  return a.prazo.localeCompare(b.prazo) || a.id.localeCompare(b.id);
}

/** Itens em aberto (nada de concluído ou resolvido), já filtrados e ordenados. */
export function listarLinhas(
  dados: DadosOperacionais,
  unidade: FiltroUnidade,
  aba: AbaTabela,
  filtro: FiltroTabela,
): LinhaTabela[] {
  const daUnidade = (id: UnidadeId) => unidade === "todas" || unidade === id;
  const nomeDaUnidade = (id: UnidadeId) =>
    dados.unidades.find((u) => u.id === id)?.nome ?? id;

  if (aba === "ocorrencias") {
    return dados.ocorrencias
      .filter(
        (o) =>
          daUnidade(o.unidadeId) &&
          o.status !== "resolvida" &&
          (filtro !== "aguardando" || o.status === "aberta"),
      )
      .map(
        (o): LinhaTabela => ({
          id: o.id,
          tipo: "ocorrencia",
          descricao: o.descricao,
          unidade: nomeDaUnidade(o.unidadeId),
          responsavel: o.responsavel,
          prazo: o.prazo,
          status: STATUS_OCORRENCIA[o.status],
          prioridade: o.prioridade,
        }),
      )
      .sort(ordenar);
  }

  return dados.tarefas
    .filter(
      (t) =>
        daUnidade(t.unidadeId) &&
        t.status !== "concluida" &&
        (filtro !== "atrasadas" || t.status === "atrasada") &&
        (filtro !== "manutencao" || t.tipo === "manutencao"),
    )
    .map(
      (t): LinhaTabela => ({
        id: t.id,
        tipo: t.tipo,
        descricao: t.descricao,
        unidade: nomeDaUnidade(t.unidadeId),
        responsavel: t.responsavel,
        prazo: t.prazo,
        status: STATUS_TAREFA[t.status],
        prioridade: t.prioridade,
      }),
    )
    .sort(ordenar);
}

/** Quantos itens abertos há em cada aba, para o número ao lado do nome. */
export function contarAbas(
  dados: DadosOperacionais,
  unidade: FiltroUnidade,
): Record<AbaTabela, number> {
  return {
    tarefas: listarLinhas(dados, unidade, "tarefas", "todos").length,
    ocorrencias: listarLinhas(dados, unidade, "ocorrencias", "todos").length,
  };
}