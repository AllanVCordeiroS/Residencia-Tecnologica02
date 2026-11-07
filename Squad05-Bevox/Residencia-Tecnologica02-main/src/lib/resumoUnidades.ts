import { calcularPainel } from "@/lib/painelOperacional";
import type {
  DadosOperacionais,
  PeriodoId,
  Unidade,
} from "@/types/operacional";

export interface LinhaResumo {
  unidade: Unidade;
  feitas: number;
  total: number;
  ocorrencias: number;
}

/** Uma linha por unidade, sempre todas: o filtro de unidade não se aplica aqui. */
export function calcularResumoUnidades(
  dados: DadosOperacionais,
  periodo: PeriodoId,
): LinhaResumo[] {
  return dados.unidades.map((unidade) => {
    // Reaproveita o cálculo do painel, filtrando por uma unidade de cada vez.
    const painel = calcularPainel(dados, { periodo, unidade: unidade.id });
    return {
      unidade,
      feitas: painel.totais.concluidas,
      total: painel.totais.previstas,
      ocorrencias: painel.ocorrenciasAbertas,
    };
  });
}