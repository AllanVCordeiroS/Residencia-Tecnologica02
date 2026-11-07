import { formatarDataLonga, somarDias } from "@/lib/datasOperacional";
import type {
  DadosOperacionais,
  FiltroUnidade,
  Ocorrencia,
  PeriodoId,
  RotinasDoDia,
  Unidade,
  UnidadeId,
} from "@/types/operacional";

export interface Filtros {
  periodo: PeriodoId;
  unidade: FiltroUnidade;
}

export interface TotaisRotinas {
  previstas: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  atrasadas: number;
}

export interface LinhaUnidade {
  unidade: Unidade;
  feitas: number;
  total: number;
}

export interface ResumoPainel {
  totais: TotaisRotinas;
  percentualConcluidas: number;
  ocorrenciasAbertas: number;
  /** Variação em % contra o período anterior; null quando não há base. */
  variacao: {
    previstas: number | null;
    concluidas: number | null;
    atrasadas: number | null;
    ocorrencias: number | null;
  };
  rotuloComparacao: string;
  porUnidade: LinhaUnidade[];
}

const DIAS_DO_PERIODO: Record<PeriodoId, number> = {
  hoje: 1,
  "7dias": 7,
  "30dias": 30,
};

const COMPARACAO: Record<PeriodoId, string> = {
  hoje: "vs. ontem",
  "7dias": "vs. 7 dias anteriores",
  "30dias": "vs. 30 dias anteriores",
};

function somarRotinas(linhas: RotinasDoDia[]): TotaisRotinas {
  const totais = {
    previstas: 0,
    concluidas: 0,
    emAndamento: 0,
    pendentes: 0,
    atrasadas: 0,
  };
  for (const linha of linhas) {
    totais.concluidas += linha.concluidas;
    totais.emAndamento += linha.emAndamento;
    totais.pendentes += linha.pendentes;
    totais.atrasadas += linha.atrasadas;
  }
  totais.previstas =
    totais.concluidas + totais.emAndamento + totais.pendentes + totais.atrasadas;
  return totais;
}

function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

/** Ocorrências ainda abertas em uma data: criadas até ela e não resolvidas até ela. */
function ocorrenciasAbertasEm(
  ocorrencias: Ocorrencia[],
  data: string,
  unidade: FiltroUnidade,
): number {
  return ocorrencias.filter(
    (o) =>
      (unidade === "todas" || o.unidadeId === unidade) &&
      o.criadaEm <= data &&
      (!o.resolvidaEm || o.resolvidaEm > data),
  ).length;
}

export function calcularPainel(
  dados: DadosOperacionais,
  filtros: Filtros,
): ResumoPainel {
  const dias = DIAS_DO_PERIODO[filtros.periodo];
  const fim = dados.dataReferencia;
  const inicio = somarDias(fim, -(dias - 1));
  const fimAnterior = somarDias(inicio, -1);
  const inicioAnterior = somarDias(fimAnterior, -(dias - 1));

  const daUnidade = (id: UnidadeId) =>
    filtros.unidade === "todas" || filtros.unidade === id;

  const linhasAtual = dados.rotinasPorDia.filter(
    (l) => daUnidade(l.unidadeId) && l.data >= inicio && l.data <= fim,
  );
  const linhasAnterior = dados.rotinasPorDia.filter(
    (l) =>
      daUnidade(l.unidadeId) &&
      l.data >= inicioAnterior &&
      l.data <= fimAnterior,
  );

  const totais = somarRotinas(linhasAtual);
  const anterior = somarRotinas(linhasAnterior);

  const ocorrenciasAbertas = ocorrenciasAbertasEm(
    dados.ocorrencias,
    fim,
    filtros.unidade,
  );
  const ocorrenciasAnteriores = ocorrenciasAbertasEm(
    dados.ocorrencias,
    fimAnterior,
    filtros.unidade,
  );

  const porUnidade = dados.unidades
    .filter((u) => daUnidade(u.id))
    .map((unidade) => {
      const t = somarRotinas(linhasAtual.filter((l) => l.unidadeId === unidade.id));
      return { unidade, feitas: t.concluidas, total: t.previstas };
    });

  return {
    totais,
    percentualConcluidas:
      totais.previstas === 0
        ? 0
        : Math.round((totais.concluidas / totais.previstas) * 100),
    ocorrenciasAbertas,
    variacao: {
      previstas: variacaoPercentual(totais.previstas, anterior.previstas),
      concluidas: variacaoPercentual(totais.concluidas, anterior.concluidas),
      atrasadas: variacaoPercentual(totais.atrasadas, anterior.atrasadas),
      ocorrencias: variacaoPercentual(ocorrenciasAbertas, ocorrenciasAnteriores),
    },
    rotuloComparacao: COMPARACAO[filtros.periodo],
    porUnidade,
  };
}

export function opcoesPeriodo(
  dataReferencia: string,
): { valor: PeriodoId; rotulo: string }[] {
  return [
    { valor: "hoje", rotulo: `Hoje, ${formatarDataLonga(dataReferencia)}` },
    { valor: "7dias", rotulo: "Últimos 7 dias" },
    { valor: "30dias", rotulo: "Últimos 30 dias" },
  ];
}

export function opcoesUnidade(
  unidades: Unidade[],
): { valor: FiltroUnidade; rotulo: string }[] {
  return [
    { valor: "todas", rotulo: "Todas as unidades" },
    ...unidades.map((u) => ({ valor: u.id as FiltroUnidade, rotulo: u.nome })),
  ];
}