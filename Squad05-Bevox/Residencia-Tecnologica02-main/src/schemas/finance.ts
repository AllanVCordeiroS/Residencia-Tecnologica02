import * as z from "zod";

export const codigoMoedaSchema = z.enum(["BRL", "USD", "EUR"]);

export const moedaConversaoSchema = z.object({
  id: z.string(),
  codigo: codigoMoedaSchema,
  bandeira: z.string(),
  taxaConversao: z.number(),
  dataAvaliacaoHistorica: z.string(),
});

export const configuracaoGeralFinancasSchema = z.object({
  moedaBase: codigoMoedaSchema,
  simboloMonetario: z.string(),
  simboloMonetarioAlternativo: z.string(),
  conversaoAutomaticaAtiva: z.boolean(),
  moedas: z.array(moedaConversaoSchema),
});

export const categoriaPlanoContasSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const regraDiasNaoUteisSchema = z.enum([
  "proximo_dia_util",
  "dia_util_anterior",
  "manter_data",
]);

export const regrasVencimentoCobrancaSchema = z.object({
  prazoPadraoFornecedoresDias: z.number(),
  regraDiasNaoUteis: regraDiasNaoUteisSchema,
  multaAtrasoPercentual: z.number().min(0).max(100),
  jurosMoraMensalPercentual: z.number().min(0).max(100),
});

export const metodoPagamentoPadraoSchema = z.enum([
  "pix_boleto_ted",
  "pix_boleto",
  "ted_doc",
  "cartao_corporativo",
]);

export const metodoRecebimentoPadraoSchema = z.enum([
  "boleto_faturado_30_60",
  "pix_a_vista",
  "cartao_credito",
]);

export const parametrosIntegracoesSchema = z.object({
  vincularVendasClientesAutomaticamente: z.boolean(),
  exigirCentroCustoLancamentos: z.boolean(),
  metodoPagamentoPadrao: metodoPagamentoPadraoSchema,
  metodoRecebimentoPadrao: metodoRecebimentoPadraoSchema,
});

export const parametrosFinanceirosSchema = z.object({
  configuracaoGeral: configuracaoGeralFinancasSchema,
  categorias: z.array(categoriaPlanoContasSchema),
  regras: regrasVencimentoCobrancaSchema,
  integracoes: parametrosIntegracoesSchema,
});

export type CodigoMoeda = z.infer<typeof codigoMoedaSchema>;
export type MoedaConversao = z.infer<typeof moedaConversaoSchema>;
export type ConfiguracaoGeralFinancas = z.infer<
  typeof configuracaoGeralFinancasSchema
>;
export type CategoriaPlanoContas = z.infer<typeof categoriaPlanoContasSchema>;
export type RegraDiasNaoUteis = z.infer<typeof regraDiasNaoUteisSchema>;
export type RegrasVencimentoCobranca = z.infer<
  typeof regrasVencimentoCobrancaSchema
>;
export type MetodoPagamentoPadrao = z.infer<
  typeof metodoPagamentoPadraoSchema
>;
export type MetodoRecebimentoPadrao = z.infer<
  typeof metodoRecebimentoPadraoSchema
>;
export type ParametrosIntegracoes = z.infer<
  typeof parametrosIntegracoesSchema
>;
export type ParametrosFinanceiros = z.infer<
  typeof parametrosFinanceirosSchema
>;
