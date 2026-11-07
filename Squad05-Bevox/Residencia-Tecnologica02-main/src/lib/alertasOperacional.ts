import { somarDias } from "@/lib/datasOperacional";
import type { AbaTabela, FiltroTabela } from "@/lib/tabelasOperacional";
import type {
  DadosOperacionais,
  FiltroUnidade,
  UnidadeId,
} from "@/types/operacional";

export type DestinoAlerta =
  | { tipo: "tabela"; aba: AbaTabela; filtro: FiltroTabela }
  | { tipo: "rota"; href: string };

export interface AlertaPainel {
  chave: "atrasadas" | "ocorrencia" | "renovacoes" | "manutencao";
  quantidade: number;
  titulo: string;
  detalhe: string;
  destino: DestinoAlerta;
}

function contar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/** Alertas da situação de "hoje"; só o filtro de unidade vale. */
export function calcularAlertas(
  dados: DadosOperacionais,
  unidade: FiltroUnidade,
): AlertaPainel[] {
  const daUnidade = (id: UnidadeId) => unidade === "todas" || unidade === id;
  const hoje = dados.dataReferencia;
  const limiteRenovacao = somarDias(hoje, 30);

  const atrasadas = dados.rotinasPorDia
    .filter((linha) => linha.data === hoje && daUnidade(linha.unidadeId))
    .reduce((soma, linha) => soma + linha.atrasadas, 0);

  // "Aberta" é a ocorrência que ainda não foi assumida por ninguém.
  const aguardando = dados.ocorrencias.filter(
    (o) => o.status === "aberta" && daUnidade(o.unidadeId),
  ).length;

  const renovacoes = dados.renovacoes.filter(
    (r) =>
      daUnidade(r.unidadeId) &&
      r.vencimento >= hoje &&
      r.vencimento <= limiteRenovacao,
  ).length;

  const manutencoes = dados.tarefas.filter(
    (t) =>
      t.tipo === "manutencao" &&
      t.status !== "concluida" &&
      daUnidade(t.unidadeId),
  );
  const unidadesComManutencao = Array.from(
    new Set(manutencoes.map((m) => m.unidadeId)),
  );
  const nomeDaUnidade = (id: UnidadeId) =>
    dados.unidades.find((u) => u.id === id)?.nome ?? id;
  const detalheManutencao =
    unidadesComManutencao.length === 1
      ? `Equipamentos: ${nomeDaUnidade(unidadesComManutencao[0])}`
      : `Em ${unidadesComManutencao.length} unidades`;

  const alertas: AlertaPainel[] = [
    {
      chave: "atrasadas",
      quantidade: atrasadas,
      titulo: contar(atrasadas, "rotina atrasada", "rotinas atrasadas"),
      detalhe: "Necessitam de ação imediata",
      destino: { tipo: "tabela", aba: "tarefas", filtro: "atrasadas" },
    },
    {
      chave: "ocorrencia",
      quantidade: aguardando,
      titulo: contar(aguardando, "ocorrência em aberto", "ocorrências em aberto"),
      detalhe: "Aguardando providências",
      destino: { tipo: "tabela", aba: "ocorrencias", filtro: "aguardando" },
    },
    {
      chave: "renovacoes",
      quantidade: renovacoes,
      titulo: contar(
        renovacoes,
        "renovação próxima do vencimento",
        "renovações próximas do vencimento",
      ),
      detalhe: "Nos próximos 30 dias",
      destino: { tipo: "rota", href: "/licencas" },
    },
    {
      chave: "manutencao",
      quantidade: manutencoes.length,
      titulo: contar(
        manutencoes.length,
        "manutenção pendente",
        "manutenções pendentes",
      ),
      detalhe: detalheManutencao,
      destino: { tipo: "tabela", aba: "tarefas", filtro: "manutencao" },
    },
  ];

  // Só aparece o que tem pelo menos 1.
  return alertas.filter((alerta) => alerta.quantidade > 0);
}