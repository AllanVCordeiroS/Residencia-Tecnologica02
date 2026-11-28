import * as z from "zod";

/** BRL em reais; arredondamento e somas usam centavos no serviço. */
export const financeEntrySchema = z.object({
  tipo: z.enum(["Receita", "Despesa"]),
  descricao: z.string().trim().min(1, "Informe a descrição.").max(200),
  valor: z.number().finite().positive("Informe um valor maior que zero.")
    .max(999999999.99).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.0001, "Use no máximo duas casas decimais."),
  categoria: z.string().trim().min(1, "Informe a categoria.").max(100),
  unidade: z.string().min(1, "Selecione a unidade."),
  contraparte: z.string().trim().min(1, "Informe a contraparte.").max(200),
  dataLancamento: z.iso.date("Informe uma data válida."),
  dataVencimento: z.iso.date("Informe um vencimento válido."),
  status: z.enum(["Pendente", "Realizado"]),
  formaPagamento: z.enum(["PIX", "Boleto", "Transferência", "Cartão", "Dinheiro", "Não informado"]),
  subcategoria: z.string().trim().max(100).default(""),
  observacao: z.string().trim().max(500).default(""),
});

export type FinanceEntryFormValues = z.infer<typeof financeEntrySchema>;

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
