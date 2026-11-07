export type CodigoMoeda = 'BRL' | 'USD' | 'EUR';

export interface OpcaoSelect<T extends string | number = string> {
  valor: T;
  rotulo: string;
}

export interface MoedaConversao {
  id: string;
  codigo: CodigoMoeda;
  bandeira: string;
  taxaConversao: number;
  dataAvaliacaoHistorica: string;
}

export interface ConfiguracaoGeralFinancas {
  moedaBase: CodigoMoeda;
  simboloMonetario: string;
  simboloMonetarioAlternativo: string;
  conversaoAutomaticaAtiva: boolean;
  moedas: MoedaConversao[];
}

export interface CategoriaPlanoContas {
  id: string;
  nome: string;
}

export type RegraDiasNaoUteis =
  | 'proximo_dia_util'
  | 'dia_util_anterior'
  | 'manter_data';

export interface RegrasVencimentoCobranca {
  prazoPadraoFornecedoresDias: number;
  regraDiasNaoUteis: RegraDiasNaoUteis;
  multaAtrasoPercentual: number;
  jurosMoraMensalPercentual: number;
}

export type MetodoPagamentoPadrao =
  | 'pix_boleto_ted'
  | 'pix_boleto'
  | 'ted_doc'
  | 'cartao_corporativo';

export type MetodoRecebimentoPadrao =
  | 'boleto_faturado_30_60'
  | 'pix_a_vista'
  | 'cartao_credito';

export interface ParametrosIntegracoes {
  vincularVendasClientesAutomaticamente: boolean;
  exigirCentroCustoLancamentos: boolean;
  metodoPagamentoPadrao: MetodoPagamentoPadrao;
  metodoRecebimentoPadrao: MetodoRecebimentoPadrao;
}

export interface ParametrosFinanceiros {
  configuracaoGeral: ConfiguracaoGeralFinancas;
  categorias: CategoriaPlanoContas[];
  regras: RegrasVencimentoCobranca;
  integracoes: ParametrosIntegracoes;
}

export type CampoComErroParametrosFinanceiros =
  | 'simboloMonetario'
  | 'simboloMonetarioAlternativo'
  | 'multaAtrasoPercentual'
  | 'jurosMoraMensalPercentual';

export type ErrosParametrosFinanceiros = Partial<
  Record<CampoComErroParametrosFinanceiros, string>
>;
