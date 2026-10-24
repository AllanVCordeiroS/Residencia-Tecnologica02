import type {
  DashboardData,
  Periodo,
  PontoSerie,
  Unidade,
} from "@/types";

const TZ = "America/Recife";

export const percentual = (parte: number, total: number): number =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

export const somar = (valores: number[]): number =>
  valores.reduce((acc, v) => acc + v, 0);

/** Variação percentual entre dois valores (null se a base for zero). */
export function variacaoPercentual(inicial: number, final: number): number | null {
  if (inicial <= 0) return null;
  return Math.round(((final - inicial) / inicial) * 100);
}

/** Formata data ISO (AAAA-MM-DD) como dd/mm/aaaa, sem depender de fuso. */
export function formatarDataBR(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function formatarDataExtensa(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, d)));
}

/** Data de hoje por extenso no fuso de Recife, ex.: "segunda-feira, 12 de outubro de 2026". */
export function hojePorExtenso(agora: Date = new Date()): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(agora);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function diaNoFuso(data: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(data);
}

/** "Hoje, 09:30" / "Ontem, 16:42" / "15/04, 10:12" relativo à data de referência. */
export function formatarRelativo(ocorridoEm: string, dataReferencia: string): string {
  const data = new Date(ocorridoEm);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(data);
  const dia = diaNoFuso(data);
  const ref = new Date(`${dataReferencia}T12:00:00Z`);
  const ontem = new Date(ref.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  if (dia === dataReferencia) return `Hoje, ${hora}`;
  if (dia === ontem) return `Ontem, ${hora}`;
  const [, m, d] = dia.split("-");
  return `${d}/${m}, ${hora}`;
}

export interface MetricaCard {
  id: "unidades" | "documentos" | "tarefas" | "licencas";
  titulo: string;
  valor: number;
  complemento: string;
  badge: { texto: string; tom: "positivo" | "aviso" | "critico" | "neutro" } | null;
  /** Progresso 0-100 e a descrição acessível dele. */
  progresso: number;
  progressoDescricao: string;
}

function rotuloMes(iso: string): string {
  const [a, m] = iso.split("-").map(Number);
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(a, m - 1, 1)))
    .replace(".", "");
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${a}`;
}

export function pontoAtual(data: DashboardData): PontoSerie {
  const { unidades, resumo } = data;
  return {
    rotulo: rotuloMes(data.dataReferencia),
    documentos: somar(unidades.map((u) => u.documentos)),
    tarefas: resumo.tarefasEmAndamento,
    licencas: resumo.licencasVigentes,
    unidades: unidades.filter((u) => u.ativa).length,
  };
}

/** Séries do gráfico: histórico + ponto atual calculado (garante coerência com os cards). */
export function montarSerie(data: DashboardData, periodo: Periodo): PontoSerie[] {
  const atual = pontoAtual(data);
  if (periodo === "30d") {
    const [, m, d] = data.dataReferencia.split("-");
    return [...data.historico.semanal, { ...atual, rotulo: `${d}/${m}` }];
  }
  const mensal = [...data.historico.mensal, atual];
  return periodo === "6m" ? mensal.slice(-6) : mensal;
}

export function montarMetricas(data: DashboardData): MetricaCard[] {
  const { unidades, resumo, historico } = data;
  const atual = pontoAtual(data);
  const mesAnterior = historico.mensal[historico.mensal.length - 1];
  const novasUnidades = atual.unidades - mesAnterior.unidades;
  const totalDocs = atual.documentos;
  const emDia = (total: number, ruim: number) => percentual(total - ruim, total);

  return [
    {
      id: "unidades",
      titulo: "Unidades Operacionais",
      valor: atual.unidades,
      complemento: "polos ativos em PE",
      badge: novasUnidades > 0 ? { texto: `+${novasUnidades} este mês`, tom: "positivo" } : null,
      progresso: percentual(atual.unidades, unidades.length),
      progressoDescricao: `${atual.unidades} de ${unidades.length} unidades ativas`,
    },
    {
      id: "documentos",
      titulo: "Documentos Emitidos",
      valor: totalDocs,
      complemento: "total acumulado",
      badge:
        resumo.documentosPendentes > 0
          ? { texto: `${resumo.documentosPendentes} pendentes`, tom: "aviso" }
          : null,
      progresso: emDia(totalDocs, resumo.documentosPendentes),
      progressoDescricao: `${emDia(totalDocs, resumo.documentosPendentes)}% dos documentos sem pendência`,
    },
    {
      id: "tarefas",
      titulo: "Tarefas de Rotina",
      valor: resumo.tarefasEmAndamento,
      complemento: "em andamento",
      badge:
        resumo.tarefasAtrasadas > 0
          ? { texto: `${resumo.tarefasAtrasadas} atrasadas`, tom: "critico" }
          : null,
      progresso: emDia(resumo.tarefasEmAndamento, resumo.tarefasAtrasadas),
      progressoDescricao: `${emDia(resumo.tarefasEmAndamento, resumo.tarefasAtrasadas)}% das tarefas dentro do prazo`,
    },
    {
      id: "licencas",
      titulo: "Licenças e Alvarás",
      valor: resumo.licencasVigentes,
      complemento: "alvarás vigentes",
      badge:
        resumo.licencasVencendo > 0
          ? { texto: `${resumo.licencasVencendo} vencendo`, tom: "aviso" }
          : null,
      progresso: emDia(resumo.licencasVigentes, resumo.licencasVencendo),
      progressoDescricao: `${emDia(resumo.licencasVigentes, resumo.licencasVencendo)}% das licenças fora da janela de vencimento`,
    },
  ];
}

export interface FatiaUnidade {
  nome: string;
  valor: number;
  cor: string;
}

export const CORES_UNIDADES = ["#1e3a8a", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#94a3b8"];

/** Agrupa as maiores unidades e soma as demais em "Outras Unidades". */
export function montarDistribuicao(unidades: Unidade[], maximo = 5): FatiaUnidade[] {
  const ordenadas = [...unidades].sort((a, b) => b.documentos - a.documentos);
  const fatias: FatiaUnidade[] = ordenadas.slice(0, maximo).map((u, i) => ({
    nome: u.nome,
    valor: u.documentos,
    cor: CORES_UNIDADES[i],
  }));
  const restantes = ordenadas.slice(maximo);
  if (restantes.length > 0) {
    fatias.push({
      nome: "Outras Unidades",
      valor: somar(restantes.map((u) => u.documentos)),
      cor: CORES_UNIDADES[CORES_UNIDADES.length - 1],
    });
  }
  return fatias;
}
