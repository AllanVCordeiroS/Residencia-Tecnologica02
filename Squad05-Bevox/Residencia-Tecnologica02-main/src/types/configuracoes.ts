export type {
  CategoriaPlanoContas,
  CodigoMoeda,
  ConfiguracaoGeralFinancas,
  MetodoPagamentoPadrao,
  MetodoRecebimentoPadrao,
  MoedaConversao,
  ParametrosFinanceiros,
  ParametrosIntegracoes,
  RegraDiasNaoUteis,
  RegrasVencimentoCobranca,
} from "@/schemas/finance";

export interface OpcaoSelect<T extends string | number = string> {
  valor: T;
  rotulo: string;
}

export type CampoComErroParametrosFinanceiros =
  | "simboloMonetario"
  | "simboloMonetarioAlternativo"
  | "multaAtrasoPercentual"
  | "jurosMoraMensalPercentual";

export type ErrosParametrosFinanceiros = Partial<
  Record<CampoComErroParametrosFinanceiros, string>
>;
